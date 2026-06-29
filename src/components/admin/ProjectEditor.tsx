"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, SaveBar, Status, TextArea, TextInput, Toggle, Loading } from "./ui";
import { MultiImageField } from "./MultiImageField";
import { MarkdownEditor } from "./MarkdownEditor";

interface ProjectForm {
  title: string;
  summary: string;
  publishedAt: string;
  images: string[];
  link: string;
  content: string;
  pinned: boolean;
}

const EMPTY: ProjectForm = {
  title: "",
  summary: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  images: [],
  link: "",
  content: "",
  pinned: false,
};

export function ProjectEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isEdit = Boolean(slug);
  const [form, setForm] = useState<ProjectForm | null>(isEdit ? null : EMPTY);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/projects/${slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const m = d.metadata || {};
        setForm({
          title: m.title || "",
          summary: m.summary || "",
          publishedAt: m.publishedAt || EMPTY.publishedAt,
          images: Array.isArray(m.images) ? m.images : [],
          link: m.link || "",
          content: d.content || "",
          pinned: Boolean(m.pinned),
        });
      })
      .catch(() => setStatus({ kind: "err", msg: "Gagal memuat proyek" }));
  }, [isEdit, slug]);

  if (!form) return <Loading />;

  const set = <K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) => setForm({ ...form, [k]: v });

  const save = async () => {
    if (!form.title.trim()) {
      setStatus({ kind: "err", msg: "Judul wajib diisi" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const url = isEdit ? `/api/admin/projects/${slug}` : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Gagal menyimpan");
      setStatus({ kind: "ok", msg: "Tersimpan ✓" });
      router.push("/admin/projects");
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="adm-h1">{isEdit ? "Edit Proyek" : "Tambah Proyek Baru"}</h1>
      <p className="adm-sub">Isi detail proyek, unggah gambar, lalu tulis deskripsinya.</p>

      <div className="adm-card">
        <Field label="Judul"><TextInput value={form.title} onChange={(v) => set("title", v)} placeholder="Nama proyek" /></Field>
        <Field label="Ringkasan singkat"><TextArea rows={2} value={form.summary} onChange={(v) => set("summary", v)} /></Field>
        <div className="adm-row">
          <Field label="Tanggal"><TextInput type="date" value={form.publishedAt} onChange={(v) => set("publishedAt", v)} /></Field>
          <Field label="Tautan eksternal (opsional)"><TextInput value={form.link} onChange={(v) => set("link", v)} /></Field>
        </div>
        <MultiImageField label="Gambar proyek" subdir="projects" values={form.images} onChange={(v) => set("images", v)} />
        <Field label="Sematkan (pin)" hint="Proyek yang disematkan tampil paling atas di halaman Work. Tidak memengaruhi urutan 'terbaru' di halaman Home.">
          <Toggle checked={form.pinned} onChange={(v) => set("pinned", v)} label="📌 Tampilkan di atas pada halaman Work" />
        </Field>
      </div>

      <div className="adm-card">
        <h3>Deskripsi Proyek</h3>
        <MarkdownEditor value={form.content} onChange={(v) => set("content", v)} subdir="projects" />
      </div>

      <SaveBar onSave={save} saving={saving} status={status}>
        <button className="adm-btn ghost" onClick={() => router.push("/admin/projects")}>Batal</button>
      </SaveBar>
    </div>
  );
}
