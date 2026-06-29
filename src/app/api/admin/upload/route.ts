import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import {
  extForMime,
  isAllowedImageType,
  resolveUploadDir,
  safeFilename,
  slugify,
} from "@/lib/admin-fs";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const subdir = String(form.get("subdir") || "uploads");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Tidak ada file" }, { status: 400 });
    }
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { message: "Tipe file tidak didukung (gunakan PNG, JPG, WEBP, atau GIF)" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "Ukuran file maksimal 8MB" }, { status: 400 });
    }

    const { dir, urlBase } = resolveUploadDir(subdir);
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const ext = extForMime(file.type);
    const filename = safeFilename(`${base}-${Date.now()}${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    return NextResponse.json({ success: true, path: `${urlBase}/${filename}` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal mengunggah", error: String(err) }, { status: 500 });
  }
}
