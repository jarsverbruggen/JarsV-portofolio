import { NextResponse } from "next/server";
import { buildAdminCookie } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.headers.set("Set-Cookie", buildAdminCookie(false));
  return response;
}
