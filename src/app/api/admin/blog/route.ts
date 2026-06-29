import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { BLOG_DIR, listMdx, mdxExists, slugify, writeMdx } from "@/lib/admin-fs";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json({ posts: listMdx(BLOG_DIR) }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, summary, tag, publishedAt, image, content, series, part, overwrite } = body || {};
    if (!title || typeof title !== "string") {
      return NextResponse.json({ message: "Judul wajib diisi" }, { status: 400 });
    }
    const slug = slugify(title);
    if (!slug) return NextResponse.json({ message: "Judul tidak valid" }, { status: 400 });

    if (mdxExists(BLOG_DIR, slug) && !overwrite) {
      return NextResponse.json({ message: "Artikel dengan judul ini sudah ada", slug }, { status: 409 });
    }

    writeMdx(
      BLOG_DIR,
      slug,
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
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Gagal membuat artikel", error: String(err) }, { status: 500 });
  }
}
