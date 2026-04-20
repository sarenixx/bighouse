import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

import { getRequestClientIp } from "@/lib/server/login-rate-limit";
import { getPrisma } from "@/lib/server/prisma";
import { consumeRateLimit } from "@/lib/server/rate-limit-store";

const WAITLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const WAITLIST_RATE_LIMIT_MAX_ATTEMPTS = 8;
const WAITLIST_RATE_LIMIT_NAMESPACE = "waitlist";
const DEFAULT_EXAMPLE_REPORT_URL = "https://amseta.com/demo";
const DEFAULT_EXAMPLE_REPORT_PDF_URL = "https://amseta.com/amseta-example-report-card.pdf";

type EmailBindingLike = {
  send(message: ExampleReportEmailPayload): Promise<unknown>;
};

type EmailAttachment = {
  content: string | ArrayBuffer;
  filename: string;
  type: string;
  disposition: "attachment" | "inline";
  contentId?: string;
};

type ExampleReportEmailPayload = {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
};

type CloudflareEnvLike = {
  EMAIL?: EmailBindingLike;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_REPORT_URL?: string;
  EMAIL_REPORT_PDF_URL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
};

type ExampleReportEmail = {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html: string;
  attachments: EmailAttachment[];
};

type EmailDeliveryResult = {
  ok: boolean;
  provider: "binding" | "rest" | "none";
  error?: string;
};

type ExampleReportPdfAsset = {
  bytes: ArrayBuffer;
  contentType: string;
};

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z.string().trim().min(2).max(80).optional()
});

function getNormalizedEmail(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const email = (payload as { email?: unknown }).email;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
}

function buildRateLimitHeaders(rateLimit: {
  retryAfterSeconds: number;
  limit: number;
  remaining: number;
}) {
  return {
    "Retry-After": String(rateLimit.retryAfterSeconds),
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining)
  };
}

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function encodeBytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function isPdf(bytes: Uint8Array) {
  if (bytes.length < 5) {
    return false;
  }

  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}

async function getCloudflareEnv() {
  try {
    const context = getCloudflareContext();
    return context.env as CloudflareEnvLike | undefined;
  } catch {}

  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as CloudflareEnvLike | undefined;
  } catch {
    return undefined;
  }
}

async function fetchExampleReportPdfAsset(reportPdfUrl: string): Promise<ExampleReportPdfAsset> {
  const response = await fetch(reportPdfUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch example report PDF (HTTP ${response.status}).`);
  }

  const bytes = await response.arrayBuffer();
  const pdfBytes = new Uint8Array(bytes);
  if (!isPdf(pdfBytes)) {
    const receivedType = response.headers.get("content-type")?.trim() ?? "unknown";
    throw new Error(`Fetched example report is not a valid PDF (content-type: ${receivedType}).`);
  }

  const contentType = response.headers.get("content-type")?.trim() || "application/pdf";

  return {
    bytes,
    contentType
  };
}

function buildExampleReportAttachment(args: {
  bytes: ArrayBuffer;
  contentType: string;
  mode: "binary" | "base64";
}): EmailAttachment {
  const content =
    args.mode === "binary" ? args.bytes : encodeBytesToBase64(new Uint8Array(args.bytes));

  return {
    content,
    filename: "amseta-example-report-card.pdf",
    type: args.contentType,
    disposition: "attachment"
  };
}

function buildExampleReportEmail(args: {
  to: string;
  from?: string;
  reportUrl: string;
  attachment: EmailAttachment;
}): ExampleReportEmail {
  const subject = "Your Amseta Example Report Card (PDF)";
  const text = [
    "Thanks for your interest in Amseta.",
    "",
    "Your example report card PDF is attached to this email.",
    "",
    `Online preview: ${args.reportUrl}`,
    "",
    "If you have questions, reply to this email and we will help."
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <p>Thanks for your interest in <strong>Amseta</strong>.</p>
      <p>Your <strong>Example Report Card (PDF)</strong> is attached to this email.</p>
      <p>
        <a href="${args.reportUrl}" style="display:inline-block;padding:10px 16px;border-radius:999px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">
          View Online Preview
        </a>
      </p>
      <p style="font-size:14px;color:#4b5563;">If you have questions, reply to this email and we will help.</p>
    </div>
  `;

  return {
    to: args.to,
    from: args.from,
    subject,
    text,
    html,
    attachments: [args.attachment]
  };
}

async function sendWithEmailBinding(binding: EmailBindingLike, email: ExampleReportEmailPayload) {
  await binding.send(email);
}

async function sendWithCloudflareRestApi(args: {
  accountId: string;
  apiToken: string;
  email: ExampleReportEmailPayload;
}) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${args.accountId}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(args.email)
    }
  );
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; errors?: Array<{ message?: string }> }
    | null;

  if (!response.ok || payload?.success === false) {
    const apiError = payload?.errors?.map((item) => item.message).filter(Boolean).join("; ");
    throw new Error(apiError || "Cloudflare Email API rejected the request.");
  }
}

async function sendExampleReportEmail(args: { to: string; origin: string }): Promise<EmailDeliveryResult> {
  const cloudflareEnv = await getCloudflareEnv();
  const binding = cloudflareEnv?.EMAIL;
  const fromAddress =
    getStringValue(cloudflareEnv?.EMAIL_FROM_ADDRESS) ?? getStringValue(process.env.EMAIL_FROM_ADDRESS);
  const reportUrl =
    getStringValue(cloudflareEnv?.EMAIL_REPORT_URL) ??
    getStringValue(process.env.EMAIL_REPORT_URL) ??
    DEFAULT_EXAMPLE_REPORT_URL;
  const accountId =
    getStringValue(cloudflareEnv?.CLOUDFLARE_ACCOUNT_ID) ??
    getStringValue(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken =
    getStringValue(cloudflareEnv?.CLOUDFLARE_EMAIL_API_TOKEN) ??
    getStringValue(process.env.CLOUDFLARE_EMAIL_API_TOKEN);
  const reportPdfUrl =
    getStringValue(cloudflareEnv?.EMAIL_REPORT_PDF_URL) ??
    getStringValue(process.env.EMAIL_REPORT_PDF_URL) ??
    (args.origin
      ? new URL("/amseta-example-report-card.pdf", args.origin).toString()
      : DEFAULT_EXAMPLE_REPORT_PDF_URL);

  let reportPdfAsset: ExampleReportPdfAsset;
  try {
    reportPdfAsset = await fetchExampleReportPdfAsset(reportPdfUrl);
  } catch (error) {
    return {
      ok: false,
      provider: "none",
      error: error instanceof Error ? error.message : "Unable to build the example report PDF."
    };
  }
  const bindingEmail = buildExampleReportEmail({
    to: args.to,
    from: fromAddress,
    reportUrl,
    attachment: buildExampleReportAttachment({
      bytes: reportPdfAsset.bytes,
      contentType: reportPdfAsset.contentType,
      mode: "binary"
    })
  });
  const restEmail = buildExampleReportEmail({
    to: args.to,
    from: fromAddress,
    reportUrl,
    attachment: buildExampleReportAttachment({
      bytes: reportPdfAsset.bytes,
      contentType: reportPdfAsset.contentType,
      mode: "base64"
    })
  });

  if (binding) {
    try {
      await sendWithEmailBinding(binding, bindingEmail);
      return { ok: true, provider: "binding" };
    } catch (error) {
      console.error("waitlist_email_binding_failed", error);
    }
  }

  if (!restEmail.from || !accountId || !apiToken) {
    return {
      ok: false,
      provider: "none",
      error:
        "Email sending is not configured. Add EMAIL binding or set EMAIL_FROM_ADDRESS, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_EMAIL_API_TOKEN."
    };
  }

  try {
    await sendWithCloudflareRestApi({
      accountId,
      apiToken,
      email: restEmail
    });
    return { ok: true, provider: "rest" };
  } catch (error) {
    return {
      ok: false,
      provider: "rest",
      error: error instanceof Error ? error.message : "Cloudflare Email REST API send failed."
    };
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const normalizedEmail = getNormalizedEmail(payload);
  const rateLimitKey = `${getRequestClientIp(request)}:${normalizedEmail || "anonymous"}`;
  const rateLimit = await consumeRateLimit({
    namespace: WAITLIST_RATE_LIMIT_NAMESPACE,
    key: rateLimitKey,
    limit: WAITLIST_RATE_LIMIT_MAX_ATTEMPTS,
    windowMs: WAITLIST_RATE_LIMIT_WINDOW_MS
  });
  const headers = buildRateLimitHeaders(rateLimit);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many waitlist attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  const parsed = waitlistSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400, headers }
    );
  }

  const prisma = await getPrisma();
  const entryData = {
    id: `waitlist-${crypto.randomUUID()}`,
    email: parsed.data.email,
    source: parsed.data.source ?? "landing-page",
    status: "pending"
  } as const;
  let created = false;

  try {
    await prisma.waitlistEntry.create({ data: entryData });
    created = true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      created = false;
    } else {
      console.error("waitlist_signup_failed", error);
      return NextResponse.json(
        { error: "Unable to join the waitlist right now. Please try again." },
        { status: 500, headers }
      );
    }
  }

  const delivery = await sendExampleReportEmail({
    to: parsed.data.email,
    origin: new URL(request.url).origin
  });
  const nextStatus = delivery.ok ? "sent" : "failed";

  try {
    await prisma.waitlistEntry.update({
      where: { email: parsed.data.email },
      data: { status: nextStatus }
    });
  } catch (error) {
    console.error("waitlist_status_update_failed", error);
  }

  if (!delivery.ok && delivery.error) {
    console.error("waitlist_email_send_failed", {
      provider: delivery.provider,
      email: parsed.data.email,
      error: delivery.error
    });
  }

  return NextResponse.json(
    {
      ok: true,
      message: delivery.ok
        ? "Check your inbox for your example report."
        : "Request received. We will send your example report shortly."
    },
    { status: created ? 201 : 200, headers }
  );
}
