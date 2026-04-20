"use client";

import { FormEvent, useEffect, useState } from "react";
import Script from "next/script";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

const primaryNavLinks = [
  { label: "The Challenge", href: "#challenge" },
  { label: "Who We Work With", href: "#who-we-work-with" },
  { label: "Services Provided", href: "#what-you-get" },
  { label: "Fee & Start", href: "#engagement" }
];

const footerColumns = [
  {
    title: "Overview",
    links: [
      { label: "The Challenge", href: "#challenge" },
      { label: "The Market Gap", href: "#market-gap" },
      { label: "What Amseta Provides", href: "#what-we-provide" }
    ]
  },
  {
    title: "Decision",
    links: [
      { label: "Who We Work With", href: "#who-we-work-with" },
      { label: "Services Provided", href: "#what-you-get" },
      { label: "Why It Matters", href: "#why-it-matters" }
    ]
  },
  {
    title: "Next Step",
    links: [
      { label: "Fee & Start", href: "#engagement" },
      { label: "Receive Example Report", href: "#top" },
      { label: "Contact", href: "mailto:hello@amseta.com" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  }
];

type ChallengeBucket = {
  key: "independence" | "accountability" | "responsibility";
  title: string;
  description: string;
};

const challengeBuckets: ChallengeBucket[] = [
  {
    key: "independence",
    title: "Independence",
    description:
      "Owners often lack an independent party to evaluate how third-party managers are truly performing."
  },
  {
    key: "accountability",
    title: "Accountability",
    description:
      "Fragmented reporting across properties and markets can delay action and weaken follow-through."
  },
  {
    key: "responsibility",
    title: "Responsibility",
    description:
      "Trustees, heirs, and passive owners carry real estate responsibility without direct day-to-day control."
  }
];

const whoWeWorkWithBubbles = [
  "Trustees and trust officers",
  "Families and heirs",
  "Family advisors",
  "Passive multi-property owners",
  "Legacy real estate stewards",
  "Multi-market ownership groups"
];

const goodFitItems = [
  "Third-party managed portfolios with multiple properties or managers",
  "Owners, trustees, and advisors who need independent monthly oversight",
  "Stakeholders who want clearer accountability without building an internal team",
  "Families using dashboards and oversight reports to bring the next generation up to speed on inherited real estate"
];

const notFitItems = [
  "Single-property owners seeking only day-to-day property management",
  "Clients looking for leasing, legal, or tax support",
  "Portfolios requiring a transaction-focused acquisition or disposition partner"
];

const whatYouGetItems = [
  {
    title: "Monthly owner-side review",
    description: "Manager reports reviewed, variances flagged, and owner-focused notes delivered."
  },
  {
    title: "Portfolio KPI monitoring",
    description: "NOI, revenue, expenses, occupancy, delinquency, and concessions tracked consistently."
  },
  {
    title: "Issue log and follow-through",
    description: "Open items tracked across managers and specialists until resolved."
  },
  {
    title: "Quarterly oversight review",
    description: "Recurring issues, performance drift, and priorities surfaced for ownership."
  },
  {
    title: "Annual stewardship summary",
    description: "Year-end oversight summary and next-year focus plan."
  },
  {
    title: "Seasoned executive team",
    description:
      "Access to veteran real estate executives with deep experience in ownership oversight, operations, and accountability."
  }
];

const whyItMattersPillars = [
  {
    title: "Visibility",
    description: "Clear view of each asset and the full portfolio."
  },
  {
    title: "Verification",
    description: "Independent check on manager execution."
  },
  {
    title: "Accountability",
    description: "Owner-side issue tracking and follow-through."
  },
  {
    title: "Continuity",
    description: "Steady oversight through transitions and disruption."
  }
];

const engagementHighlights = [
  {
    label: "Fee model",
    value: "Fixed monthly fee, scoped to portfolio complexity and manager footprint."
  },
  {
    label: "Onboarding timeline",
    value: "Initial oversight cadence and issue tracking launched within the first 30 days."
  },
  {
    label: "Commitment",
    value: "Designed for ongoing hold-period stewardship, not one-off transaction support."
  }
];

const onboardingSteps = [
  "20-minute fit call",
  "Portfolio and reporting intake",
  "Initial priorities and accountability map",
  "Monthly oversight cadence launched"
];

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

declare global {
  interface Window {
    amsetaTurnstileCallback?: (token: string) => void;
    amsetaTurnstileExpired?: () => void;
    amsetaTurnstileError?: () => void;
    turnstile?: {
      reset(widget?: string | HTMLElement): void;
    };
  }
}

function Logo({
  className = "h-7 w-7",
  fill = "white"
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <path
        d="M128 28c-39.7 0-72 32.3-72 72 0 16.7 5.7 32.2 15.3 44.6C82.8 158.9 103.6 168 128 168c39.7 0 72-32.3 72-72s-32.3-68-72-68Z"
        fill={fill}
        opacity="0.18"
      />
      <path
        d="M66 112c0-34.2 27.8-62 62-62 24.4 0 45.7 14.2 55.8 34.8-8.4-5-18.2-7.8-28.8-7.8-31.5 0-57 25.5-57 57 0 21.8 12.3 40.7 30.4 50.2-34.6-.2-62.4-28.1-62.4-62.2Z"
        fill={fill}
      />
      <path
        d="M128 228c39.7 0 72-32.3 72-72 0-16.7-5.7-32.2-15.3-44.6-11.5-14.3-32.3-23.4-56.7-23.4-39.7 0-72 32.3-72 72s32.3 68 72 68Z"
        fill={fill}
        opacity="0.72"
      />
      <path
        d="M190 144c0 34.2-27.8 62-62 62-24.4 0-45.7-14.2-55.8-34.8 8.4 5 18.2 7.8 28.8 7.8 31.5 0 57-25.5 57-57 0-21.8-12.3-40.7-30.4-50.2 34.6.2 62.4 28.1 62.4 62.2Z"
        fill={fill}
      />
    </svg>
  );
}

function GradientBorderButton({
  children,
  className = "",
  href
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `gradient-border-btn rounded-full px-5 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button className={classes}>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function SectionTitle({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-6 text-center text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-950 sm:text-[50px] ${className}`}
    >
      {children}
    </h2>
  );
}

function ChallengeIcon({ kind }: { kind: ChallengeBucket["key"] }) {
  if (kind === "independence") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 5 6v5c0 4.9 2.9 8.2 7 10 4.1-1.8 7-5.1 7-10V6l-7-3Z" />
        <path d="M12 8v8" />
      </svg>
    );
  }

  if (kind === "accountability") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 9h6M9 13h2" />
        <path d="m11 16 1.7 1.7L16 14.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v12" />
      <path d="M6 8h12" />
      <path d="M6 8c0 2.2 1.8 4 4 4h2" />
      <path d="M18 8c0 2.2-1.8 4-4 4h-2" />
      <path d="M9 20h6" />
    </svg>
  );
}

function WhyItMattersCircle() {
  return (
    <div className="mx-auto w-full max-w-[360px] sm:max-w-[440px]">
      <div className="relative aspect-square">
        <div
          className="absolute inset-[10%] rounded-full border border-black/15 shadow-inner"
          style={{
            background:
              "conic-gradient(rgba(24,24,27,0.18) 0deg 90deg, rgba(245,158,11,0.3) 90deg 180deg, rgba(24,24,27,0.15) 180deg 270deg, rgba(245,158,11,0.24) 270deg 360deg)"
          }}
        />
        <div className="absolute inset-[24%] rounded-full border border-black/10 bg-white/90" />
        <div className="absolute inset-[29%] flex items-center justify-center rounded-full bg-white/95 px-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700 sm:text-xs">
            Amseta Impact
          </p>
        </div>
        {whyItMattersPillars.map((pillar, index) => {
          const angle = (index / whyItMattersPillars.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 34;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <div
              key={pillar.title}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-black/15 bg-white/92 px-3 py-2 text-center shadow-sm sm:w-[132px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-900 sm:text-xs">
                {pillar.title}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-700">{pillar.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClientDashboardLandingPage({
  publicMode = false
}: {
  publicMode?: boolean;
}) {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistHoneypot, setWaitlistHoneypot] = useState("");
  const [waitlistTurnstileToken, setWaitlistTurnstileToken] = useState("");
  const [waitlistFormStartedAtMs] = useState(() => Date.now());
  const [waitlistState, setWaitlistState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistMessage, setWaitlistMessage] = useState("");

  useEffect(() => {
    if (!publicMode || !TURNSTILE_SITE_KEY) {
      return;
    }

    window.amsetaTurnstileCallback = (token: string) => {
      setWaitlistTurnstileToken(token);
    };
    window.amsetaTurnstileExpired = () => {
      setWaitlistTurnstileToken("");
    };
    window.amsetaTurnstileError = () => {
      setWaitlistTurnstileToken("");
    };

    return () => {
      delete window.amsetaTurnstileCallback;
      delete window.amsetaTurnstileExpired;
      delete window.amsetaTurnstileError;
    };
  }, [publicMode]);

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!waitlistEmail.trim()) {
      return;
    }

    if (TURNSTILE_SITE_KEY && !waitlistTurnstileToken) {
      setWaitlistState("error");
      setWaitlistMessage("Please complete the verification challenge.");
      return;
    }

    setWaitlistState("loading");
    setWaitlistMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: waitlistEmail,
          source: "landing-page-example-report",
          honeypot: waitlistHoneypot,
          formStartedAtMs: waitlistFormStartedAtMs,
          turnstileToken: waitlistTurnstileToken || undefined
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setWaitlistState("error");
        setWaitlistMessage(
          payload?.error ?? "Unable to submit your request right now. Please try again shortly."
        );
        return;
      }

      setWaitlistState("success");
      setWaitlistMessage(
        payload?.message ?? "Thanks. We will send a test example report shortly."
      );
      setWaitlistEmail("");
      setWaitlistHoneypot("");
      setWaitlistTurnstileToken("");
      window.turnstile?.reset();
    } catch {
      setWaitlistState("error");
      setWaitlistMessage("Unable to submit your request right now. Please try again shortly.");
      setWaitlistTurnstileToken("");
      window.turnstile?.reset();
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-zinc-950 selection:bg-amber-500/30 selection:text-zinc-950">
      {publicMode && TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          src={VIDEO_URL}
          style={{
            pointerEvents: "none",
            opacity: 0.78,
            transform: "scale(1.04)"
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0.12)_46%,rgba(255,255,255,0.22)_78%,rgba(255,255,255,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.18)_100%)]" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex w-full max-w-7xl items-center justify-between gap-3 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:gap-8 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Logo className="h-6 w-6 sm:h-7 sm:w-7" />
            <div className="hidden items-center gap-6 md:flex">
              {primaryNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-zinc-700 transition-colors duration-150 hover:text-zinc-950"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <a href="/login" className="text-sm font-semibold text-zinc-800 transition-colors hover:text-zinc-950">
              Client Login
            </a>
            <a
              href="mailto:hello@amseta.com"
              className="text-sm font-semibold text-zinc-800 transition-colors hover:text-zinc-950"
            >
              Contact Us
            </a>
          </div>
          <div className="md:hidden">
            {publicMode ? (
              <GradientBorderButton href="/login" className="px-4 py-2 text-xs sm:px-5 sm:text-sm">
                Client Login
              </GradientBorderButton>
            ) : (
              <GradientBorderButton className="px-4 py-2 text-xs sm:px-5 sm:text-sm">
                Client Login
              </GradientBorderButton>
            )}
          </div>
        </div>
      </nav>

      <main
        id="top"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-[124px] text-center sm:px-6 sm:pb-24 sm:pt-[140px]"
      >
        <div className="animate-float-up mb-6 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-700 backdrop-blur-md sm:mb-8 sm:text-xs sm:tracking-[0.28em]">
          Amseta | Real Estate Fiduciary
        </div>
        <h1 className="animate-float-up max-w-[900px] text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-[60px] sm:leading-[1.05] sm:tracking-[-0.04em]">
          Independent oversight
          <br />
          for third-party managed
          <br />
          real estate portfolios
        </h1>
        <p className="animate-float-up-delay mt-6 max-w-[760px] text-base leading-relaxed text-zinc-800 sm:mt-8 sm:text-lg">
          Amseta is a real estate fiduciary.
        </p>
        <div className="animate-float-up-delay-2 mt-10 w-full max-w-3xl rounded-[24px] border border-black/10 bg-white/55 p-4 backdrop-blur-md sm:p-6">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-700 sm:text-xs sm:tracking-[0.32em]">
            Receive an example report
          </div>
          <p className="mb-4 text-sm leading-relaxed text-zinc-800 sm:text-base">
            Enter your email address and we will send a test example report.
          </p>
          {publicMode ? (
            <form onSubmit={handleWaitlistSubmit} className="mb-4 text-left">
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="company-website">Company website</label>
                <input
                  id="company-website"
                  name="company_website"
                  autoComplete="off"
                  tabIndex={-1}
                  value={waitlistHoneypot}
                  onChange={(event) => setWaitlistHoneypot(event.target.value)}
                />
              </div>
              <label htmlFor="waitlist-email" className="mb-2 block text-sm font-semibold text-zinc-800">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  id="waitlist-email"
                  type="email"
                  value={waitlistEmail}
                  onChange={(event) => {
                    setWaitlistEmail(event.target.value);
                    if (waitlistState !== "idle") {
                      setWaitlistState("idle");
                      setWaitlistMessage("");
                    }
                  }}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-full border border-black/10 bg-white px-5 text-base text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none sm:flex-1"
                />
                <button
                  type="submit"
                  disabled={waitlistState === "loading"}
                  className="h-12 rounded-full bg-zinc-950 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                >
                  {waitlistState === "loading" ? "Sending..." : "Send"}
                </button>
              </div>
              {TURNSTILE_SITE_KEY ? (
                <div className="mt-3 flex justify-center sm:justify-start">
                  <div
                    className="cf-turnstile"
                    data-sitekey={TURNSTILE_SITE_KEY}
                    data-theme="light"
                    data-callback="amsetaTurnstileCallback"
                    data-expired-callback="amsetaTurnstileExpired"
                    data-error-callback="amsetaTurnstileError"
                  />
                </div>
              ) : null}
            </form>
          ) : null}
          {publicMode && waitlistMessage ? (
            <p
              className={`mb-4 text-sm leading-relaxed ${
                waitlistState === "error" ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {waitlistMessage}
            </p>
          ) : null}
        </div>
      </main>

      <section id="challenge" className="relative z-10 pb-10 pt-6 sm:pb-14 sm:pt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle className="text-[38px] sm:text-[54px]">The Challenge</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {challengeBuckets.map((bucket) => (
              <div
                key={bucket.title}
                className="rounded-[18px] border border-black/10 bg-white/65 px-5 py-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white/90 text-zinc-900">
                  <ChallengeIcon kind={bucket.key} />
                </div>
                <h3 className="mb-2 text-lg font-semibold leading-tight text-zinc-950 sm:text-xl">
                  {bucket.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-800 sm:text-base">
                  {bucket.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="market-gap" className="relative z-10 pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>The Market Gap</SectionTitle>
          <div className="rounded-[18px] border border-black/10 bg-white/65 px-6 py-7 text-center sm:px-8 sm:py-9">
            <div className="space-y-3 text-sm leading-relaxed text-zinc-800 sm:text-base">
              <p>
                Property management covers operations. Brokerage covers transactions. Tax, legal,
                and compliance advisors cover their own domains.
              </p>
              <p>
                What&apos;s missing is independent, owner-side oversight during the hold period,
                when assets are owned but not actively transacted.
              </p>
              <p>
                That gap sits between acquisition and disposition, and it is where accountability
                often breaks down.
              </p>
              <p className="font-semibold text-zinc-950">Amseta fills that gap.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-provide" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>What Amseta Provides</SectionTitle>
          <div className="rounded-[24px] border border-black/10 bg-white/65 px-6 py-8 backdrop-blur-md sm:px-9 sm:py-10">
            <div className="space-y-4 text-sm leading-relaxed text-zinc-800 sm:text-base">
              <p>
                Amseta is a fixed-fee owner-side oversight and coordination service for real estate
                portfolios managed by third parties.
              </p>
              <p>
                We sit between ownership and service providers to verify performance, maintain
                accountability, and coordinate follow-through during long-term hold periods.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["Independent oversight", "Fixed-fee stewardship", "Cross-provider coordination"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-black/15 bg-white/90 px-4 py-2 text-center text-sm font-semibold text-zinc-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="what-you-get" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>Services Provided</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whatYouGetItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-black/10 bg-white/65 px-5 py-5 text-left"
              >
                <h3 className="mb-2 text-base font-semibold text-zinc-950 sm:text-lg">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-800 sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-4xl text-center text-sm leading-relaxed text-zinc-800 sm:text-base">
            This is owner-side oversight. Amseta does not replace property management, legal, tax,
            or leasing providers.
          </p>
        </div>
      </section>

      <section id="who-we-work-with" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>Who We Work With</SectionTitle>
          <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 sm:gap-4">
            {whoWeWorkWithBubbles.map((item) => (
              <li
                key={item}
                className="rounded-full border border-black/15 bg-white/82 px-4 py-2 text-center text-sm font-medium text-zinc-900 backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-black/10 bg-white/65 px-5 py-5">
              <h3 className="mb-3 text-base font-semibold uppercase tracking-[0.08em] text-zinc-900 sm:text-lg">
                Good fit
              </h3>
              <ul className="space-y-2">
                {goodFitItems.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-zinc-800 sm:text-base">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-white/65 px-5 py-5">
              <h3 className="mb-3 text-base font-semibold uppercase tracking-[0.08em] text-zinc-900 sm:text-lg">
                Not a fit
              </h3>
              <ul className="space-y-2">
                {notFitItems.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-zinc-800 sm:text-base">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="why-it-matters" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>Why It Matters</SectionTitle>
          <div className="rounded-[32px] border border-black/10 bg-white/55 px-6 py-10 backdrop-blur-md sm:px-10 sm:py-14">
            <p className="mb-8 text-center text-base leading-relaxed text-zinc-800 sm:text-lg">
              Amseta gives ownership a repeatable oversight loop that improves decisions and
              reduces hidden drift over long hold periods.
            </p>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <WhyItMattersCircle />
              <ul className="space-y-3">
                {whyItMattersPillars.map((pillar) => (
                  <li
                    key={pillar.title}
                    className="rounded-[18px] border border-black/10 bg-white/65 px-4 py-3"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-950 sm:text-base">
                      {pillar.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-800 sm:text-base">
                      {pillar.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="engagement" className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>Fee & Start</SectionTitle>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-black/10 bg-white/65 px-6 py-7">
              <h3 className="mb-4 text-lg font-semibold text-zinc-950 sm:text-xl">
                Commercial clarity
              </h3>
              <ul className="space-y-3">
                {engagementHighlights.map((item) => (
                  <li key={item.label} className="text-sm leading-relaxed text-zinc-800 sm:text-base">
                    <span className="font-semibold text-zinc-950">{item.label}:</span> {item.value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/65 px-6 py-7">
              <h3 className="mb-4 text-lg font-semibold text-zinc-950 sm:text-xl">How we start</h3>
              <ol className="space-y-3">
                {onboardingSteps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm leading-relaxed text-zinc-800 sm:text-base"
                  >
                    <span className="mt-[1px] inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-black/10 bg-white/75 px-6 py-8 text-center">
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-zinc-800 sm:text-base">
              Ready to see what this looks like on real numbers and real manager reporting?
            </p>
            <a
              href="#top"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-zinc-800 sm:text-sm"
            >
              Receive an example report
            </a>
            <p className="mt-4 text-sm text-zinc-700">
              Questions now?{" "}
              <a href="mailto:hello@amseta.com" className="font-semibold text-zinc-900">
                hello@amseta.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 flex flex-col justify-between gap-12 sm:mb-24 sm:gap-16 lg:flex-row">
            <div className="max-w-xs">
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-9" />
                <span className="text-2xl font-semibold tracking-tighter">Amseta</span>
              </div>
              <p className="mt-6 max-w-xs leading-relaxed text-zinc-700">
                Real estate fiduciary oversight for third-party managed portfolios.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-16">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-700">{column.title}</div>
                  <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-700">
                    {column.links.map((link) => (
                      <a key={link.label} href={link.href} className="transition-colors hover:text-zinc-950">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-5 pt-8 text-sm text-zinc-700 sm:pt-12 md:flex-row md:items-center">
            <div>© 2026 Amseta. All rights reserved.</div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-700">
              <a
                href="https://www.linkedin.com/in/josh-e-7778668a/"
                className="transition-colors hover:text-zinc-950"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
