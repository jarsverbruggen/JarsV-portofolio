import { NextRequest, NextResponse } from "next/server";
import * as cookie from "cookie";

/**
 * Admin authentication helpers for the local CMS.
 *
 * The admin area is intended for LOCAL editing only (run `npm run dev`, edit at
 * /admin, files are written to disk). Every /api/admin/* route MUST call
 * requireAdmin(request) first and return its result if non-null.
 */

export const ADMIN_COOKIE = "adminToken";
export const ADMIN_COOKIE_VALUE = "authenticated";
const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours

/** The password that unlocks the admin area (falls back to the page password). */
export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || process.env.PAGE_ACCESS_PASSWORD;
}

/** True when the request carries a valid admin session cookie. */
export function isAdmin(request: NextRequest): boolean {
  const header = request.headers.get("cookie") || "";
  const cookies = cookie.parse(header);
  return cookies[ADMIN_COOKIE] === ADMIN_COOKIE_VALUE;
}

/**
 * Guard for admin API routes. Returns a Response to short-circuit the handler
 * when the request is not allowed, or null when the caller may proceed.
 *
 * Writes are additionally blocked in production: the CMS persists to the local
 * filesystem, which is read-only/ephemeral on serverless hosts (e.g. Vercel).
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (request.method !== "GET" && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        message:
          "Admin editing is disabled in production. Run the site locally (npm run dev) to edit content.",
      },
      { status: 403 },
    );
  }

  if (!isAdmin(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/** Serialize the admin session cookie (set on login, cleared on logout). */
export function buildAdminCookie(authenticated: boolean): string {
  return cookie.serialize(ADMIN_COOKIE, authenticated ? ADMIN_COOKIE_VALUE : "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: authenticated ? ADMIN_MAX_AGE : 0,
    sameSite: "strict",
    path: "/",
  });
}
