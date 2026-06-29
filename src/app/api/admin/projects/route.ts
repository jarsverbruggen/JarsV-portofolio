import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { PROJECT_DIR, listMdx, mdxExists, slugify, writeMdx } from "@/lib/admin-fs";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ projects: listMdx(PROJECT_DIR) }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, summary, publishedAt, images, link, content, pinned, overwrite } = body || {};
    if (!title || typeof title !== "string") {
      return NextResponse.json({ message: "Judul wajib diisi" }, { status: 400 });
    }
    const slug = slugify(title);
    if (!slug) return NextResponse.json({ message: "Judul tidak valid" }, { status: 400 });

    if (mdxExists(PROJECT_DIR, slug) && !overwrite) {
      return NextResponse.json({ message: "Proyek dengan judul ini sudah ada", slug }, { status: 409 });
    }

    writeMdx(
      PROJECT_DIR,
      slug,
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
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal membuat proyek", error: String(err) }, { status: 500 });
  }
}
