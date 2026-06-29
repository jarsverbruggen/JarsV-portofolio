import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hide the local-only admin CMS from the deployed (production) site.
 *
 * The admin panel persists content by writing to the filesystem, which is
 * read-only/ephemeral on serverless hosts (e.g. Vercel) — so it only works
 * locally (`npm run dev`). To avoid exposing an unnecessary attack surface,
 * we make /admin and /api/admin/* return 404 in production. Locally
 * (development) the admin area keeps working as normal.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
