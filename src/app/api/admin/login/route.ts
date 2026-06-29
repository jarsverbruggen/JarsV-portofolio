import { NextRequest, NextResponse } from "next/server";
import { buildAdminCookie, getAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: undefined }));
  const correctPassword = getAdminPassword();

  if (!correctPassword) {
    console.error("ADMIN_PASSWORD (or PAGE_ACCESS_PASSWORD) environment variable is not set");
    return NextResponse.json(
      { message: "Server belum dikonfigurasi: set ADMIN_PASSWORD di file .env.local" },
      { status: 500 },
    );
  }

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set("Set-Cookie", buildAdminCookie(true));
    return response;
  }

  return NextResponse.json({ message: "Password salah" }, { status: 401 });
}
