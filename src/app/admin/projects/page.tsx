"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdxEntry } from "@/components/admin/types";
import { Loading } from "@/components/admin/ui";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<MdxEntry[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = () => {
    fetch("/api/admin/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => setError("Gagal memuat daftar"));
  };

  useEffect(load, []);

  const remove = async (slug: string) => {
    if (!window.confirm("Hapus proyek ini?")) return;
    await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
    load();
  };

  if (error) return <p className="adm-toast err">{error}</p>;
  if (!projects) return <Loading />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="adm-h1">Proyek</h1>
        <Link href="/admin/projects/new" className="adm-btn primary">+ Tambah proyek</Link>
      </div>
      <p className="adm-sub">{projects.length} proyek.</p>

      {[...projects]
        .sort((a, b) => Number(Boolean(b.metadata.pinned)) - Number(Boolean(a.metadata.pinned)))
        .map((p) => (
        <div className="adm-list-row" key={p.slug}>
          <div>
            <div>
              {String(p.metadata.title || p.slug)}
              {p.metadata.pinned ? <span className="adm-tag" style={{ marginLeft: 8 }}>📌 Disematkan</span> : null}
            </div>
            <div className="meta">{String(p.metadata.publishedAt || "")} · {p.slug}</div>
          </div>
          <div className="adm-item-actions">
            <Link href={`/admin/projects/${p.slug}`} className="adm-btn sm">Edit</Link>
            <button className="adm-btn sm danger" onClick={() => remove(p.slug)}>Hapus</button>
          </div>
        </div>
      ))}
      {projects.length === 0 ? <p className="adm-muted">Belum ada proyek.</p> : null}
    </div>
  );
}
