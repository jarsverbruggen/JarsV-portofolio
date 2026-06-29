import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (isAdmin(request)) {
    return NextResponse.json({ admin: true }, { status: 200 });
  }
  return NextResponse.json({ admin: false }, { status: 401 });
}
