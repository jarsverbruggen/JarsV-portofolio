"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdxEntry } from "@/components/admin/types";
import { Loading } from "@/components/admin/ui";

export default function BlogListPage() {
  const [posts, setPosts] = useState<MdxEntry[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = () => {
    fetch("/api/admin/blog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setError("Gagal memuat daftar"));
  };

  useEffect(load, []);

  const remove = async (slug: string) => {
    if (!window.confirm("Hapus artikel ini?")) return;
    await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
    load();
  };

  if (error) return <p className="adm-toast err">{error}</p>;
  if (!posts) return <Loading />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="adm-h1">Blog</h1>
        <Link href="/admin/blog/new" className="adm-btn primary">+ Tulis artikel</Link>
      </div>
      <p className="adm-sub">{posts.length} artikel.</p>

      {posts.map((p) => (
        <div className="adm-list-row" key={p.slug}>
          <div>
            <div>
              {String(p.metadata.title || p.slug)}
              {p.metadata.series ? (
                <span className="adm-tag" style={{ marginLeft: 8 }}>
                  🎬 {String(p.metadata.series)}{p.metadata.part ? ` · Part ${String(p.metadata.part)}` : ""}
                </span>
              ) : null}
            </div>
            <div className="meta">{String(p.metadata.publishedAt || "")} · {p.slug}</div>
          </div>
          <div className="adm-item-actions">
            <Link href={`/admin/blog/${p.slug}`} className="adm-btn sm">Edit</Link>
            <button className="adm-btn sm danger" onClick={() => remove(p.slug)}>Hapus</button>
          </div>
        </div>
      ))}
      {posts.length === 0 ? <p className="adm-muted">Belum ada artikel.</p> : null}
    </div>
  );
}
