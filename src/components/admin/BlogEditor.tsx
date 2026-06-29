"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, SaveBar, Status, TextArea, TextInput, Loading } from "./ui";
import { ImageUploadField } from "./ImageUploadField";
import { MarkdownEditor } from "./MarkdownEditor";

interface BlogForm {
  title: string;
  summary: string;
  tag: string;
  publishedAt: string;
  image: string;
  content: string;
  series: string;
  part: string;
}

const EMPTY: BlogForm = {
  title: "",
  summary: "",
  tag: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  image: "",
  content: "",
  series: "",
  part: "",
};

export function BlogEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isEdit = Boolean(slug);
  const [form, setForm] = useState<BlogForm | null>(isEdit ? null : EMPTY);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/blog/${slug}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const m = d.metadata || {};
        setForm({
          title: m.title || "",
          summary: m.summary || "",
          tag: m.tag || "",
          publishedAt: m.publishedAt || EMPTY.publishedAt,
          image: m.image || "",
          content: d.content || "",
          series: m.series || "",
          part: typeof m.part === "number" ? String(m.part) : "",
        });
      })
      .catch(() => setStatus({ kind: "err", msg: "Gagal memuat artikel" }));
  }, [isEdit, slug]);

  if (!form) return <Loading />;

  const set = (k: keyof BlogForm, v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    if (!form.title.trim()) {
      setStatus({ kind: "err", msg: "Judul wajib diisi" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const url = isEdit ? `/api/admin/blog/${slug}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || "Gagal menyimpan");
      setStatus({ kind: "ok", msg: "Tersimpan ✓" });
      router.push("/admin/blog");
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="adm-h1">{isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}</h1>
      <p className="adm-sub">Isi judul dan tulis isinya di kotak editor. Gambar bisa langsung disisipkan.</p>

      <div className="adm-card">
        <Field label="Judul"><TextInput value={form.title} onChange={(v) => set("title", v)} placeholder="Judul artikel" /></Field>
        <Field label="Ringkasan singkat"><TextArea rows={2} value={form.summary} onChange={(v) => set("summary", v)} /></Field>
        <div className="adm-row">
          <Field label="Tag / kategori"><TextInput value={form.tag} onChange={(v) => set("tag", v)} /></Field>
          <Field label="Tanggal terbit"><TextInput type="date" value={form.publishedAt} onChange={(v) => set("publishedAt", v)} /></Field>
        </div>
        <div className="adm-row">
          <Field label="Nama seri (opsional)" hint="Isi nama yang SAMA untuk artikel yang berhubungan agar dikelompokkan jadi satu seri/playlist.">
            <TextInput value={form.series} onChange={(v) => set("series", v)} placeholder="mis. Belajar MikroTik" />
          </Field>
          <Field label="Bagian ke- (opsional)" hint="Nomor urutan dalam seri, mis. 1, 2, 3.">
            <TextInput type="number" value={form.part} onChange={(v) => set("part", v)} placeholder="1" />
          </Field>
        </div>
        <ImageUploadField label="Gambar sampul" subdir="uploads" value={form.image} onChange={(v) => set("image", v)} aspect={16 / 9} />
      </div>

      <div className="adm-card">
        <h3>Isi Artikel</h3>
        <MarkdownEditor value={form.content} onChange={(v) => set("content", v)} subdir="uploads" />
      </div>

      <SaveBar onSave={save} saving={saving} status={status}>
        <button className="adm-btn ghost" onClick={() => router.push("/admin/blog")}>Batal</button>
      </SaveBar>
    </div>
  );
}
