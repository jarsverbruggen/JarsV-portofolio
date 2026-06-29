import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readContentJson, writeContentJson } from "@/lib/admin-fs";

const REQUIRED_KEYS = ["person", "newsletter", "social", "home", "about", "blog", "work", "gallery"];

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    return NextResponse.json(readContentJson(), { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal membaca konten", error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
    }
    for (const key of REQUIRED_KEYS) {
      if (!(key in body)) {
        return NextResponse.json({ message: `Field '${key}' hilang` }, { status: 400 });
      }
    }
    writeContentJson(body);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal menyimpan konten", error: String(err) }, { status: 500 });
  }
}
