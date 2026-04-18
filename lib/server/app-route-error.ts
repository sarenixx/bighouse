import { NextResponse } from "next/server";

export class AppRouteError extends Error {
  status: number;
  code: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "AppRouteError";
    this.status = options?.status ?? 400;
    this.code = options?.code ?? "bad_request";
  }
}

export function isAppRouteError(error: unknown): error is AppRouteError {
  return error instanceof AppRouteError;
}

export function toErrorResponse(error: unknown) {
  if (isAppRouteError(error)) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  return NextResponse.json(
    { error: "Something went wrong while processing the request." },
    { status: 500 }
  );
}
