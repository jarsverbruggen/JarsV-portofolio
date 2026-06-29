import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { PROJECT_DIR, deleteMdx, mdxExists, readMdx, slugify, writeMdx } from "@/lib/admin-fs";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const entry = readMdx(PROJECT_DIR, slug);
    if (!entry) return NextResponse.json({ message: "Proyek tidak ditemukan" }, { status: 404 });
    return NextResponse.json(entry, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Permintaan tidak valid", error: String(err) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { slug } = await params;
    if (!mdxExists(PROJECT_DIR, slug)) {
      return NextResponse.json({ message: "Proyek tidak ditemukan" }, { status: 404 });
    }
    const body = await request.json();
    const { title, summary, publishedAt, images, link, content, pinned } = body || {};
    if (!title || typeof title !== "string") {
      return NextResponse.json({ message: "Judul wajib diisi" }, { status: 400 });
    }

    const newSlug = slugify(title);
    if (newSlug !== slug && mdxExists(PROJECT_DIR, newSlug)) {
      return NextResponse.json({ message: "Sudah ada proyek lain dengan judul ini" }, { status: 409 });
    }

    writeMdx(
      PROJECT_DIR,
      newSlug,
      {
        title,
        publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
        summary: summary || "",
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        link: link || "",
        pinned: pinned ? true : undefined,
      },
      content || "",
    );
    if (newSlug !== slug) deleteMdx(PROJECT_DIR, slug);

    return NextResponse.json({ success: true, slug: newSlug }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal menyimpan proyek", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const ok = deleteMdx(PROJECT_DIR, slug);
    if (!ok) return NextResponse.json({ message: "Proyek tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Permintaan tidak valid", error: String(err) }, { status: 400 });
  }
}
