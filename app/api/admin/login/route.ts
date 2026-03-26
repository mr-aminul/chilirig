import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_AUTH_COOKIE_NAME,
  createAdminSessionToken,
} from "@/lib/auth";

const loginSchema = z.object({
  password: z.string().min(1),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; lockUntilMs?: number }>();

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  const entry = failedAttempts.get(clientId);
  if (entry?.lockUntilMs && entry.lockUntilMs > now) {
    const retryAfterSeconds = Math.ceil((entry.lockUntilMs - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: "Too many failed attempts. Please try again later.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid login payload",
        },
        { status: 400 }
      );
    }

    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Set ADMIN_PASSWORD in your environment",
        },
        { status: 500 }
      );
    }

    if (parsed.data.password === expectedPassword) {
      const sessionToken = await createAdminSessionToken();
      if (!sessionToken) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create session token",
          },
          { status: 500 }
        );
      }
      failedAttempts.delete(clientId);
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      response.cookies.set(ADMIN_AUTH_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      });

      return response;
    }

    const nextCount = (entry?.count ?? 0) + 1;
    const lockUntilMs =
      nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_WINDOW_MS : undefined;
    failedAttempts.set(clientId, { count: nextCount, lockUntilMs });

    return NextResponse.json(
      {
        success: false,
        error: "Invalid password",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process login",
      },
      { status: 500 }
    );
  }
}
