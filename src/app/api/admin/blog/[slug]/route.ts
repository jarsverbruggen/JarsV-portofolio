import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { BLOG_DIR, deleteMdx, mdxExists, readMdx, slugify, writeMdx } from "@/lib/admin-fs";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const entry = readMdx(BLOG_DIR, slug);
    if (!entry) return NextResponse.json({ message: "Artikel tidak ditemukan" }, { status: 404 });
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
    if (!mdxExists(BLOG_DIR, slug)) {
      return NextResponse.json({ message: "Artikel tidak ditemukan" }, { status: 404 });
    }
    const body = await request.json();
    const { title, summary, tag, publishedAt, image, content, series, part } = body || {};
    if (!title || typeof title !== "string") {
      return NextResponse.json({ message: "Judul wajib diisi" }, { status: 400 });
    }

    const newSlug = slugify(title);
    if (newSlug !== slug && mdxExists(BLOG_DIR, newSlug)) {
      return NextResponse.json({ message: "Sudah ada artikel lain dengan judul ini" }, { status: 409 });
    }

    writeMdx(
      BLOG_DIR,
      newSlug,
      {
        title,
        summary: summary || "",
        tag: tag || "",
        publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
        image: image || "",
        series: typeof series === "string" && series.trim() ? series.trim() : undefined,
        part:
          String(part ?? "").trim() !== "" && Number.isFinite(Number(part))
            ? Number(part)
            : undefined,
      },
      content || "",
    );
    if (newSlug !== slug) deleteMdx(BLOG_DIR, slug);

    return NextResponse.json({ success: true, slug: newSlug }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal menyimpan artikel", error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const ok = deleteMdx(BLOG_DIR, slug);
    if (!ok) return NextResponse.json({ message: "Artikel tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Permintaan tidak valid", error: String(err) }, { status: 400 });
  }
}
