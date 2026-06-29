"use client";

import { useEffect, useState } from "react";
import { loadContent, saveContent } from "@/components/admin/content-api";
import { ContentData } from "@/components/admin/types";
import { Field, Loading, SaveBar, Status, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function HomePage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    loadContent().then(setData).catch((e) => setStatus({ kind: "err", msg: String(e) }));
  }, []);

  if (!data) return <Loading />;

  const home = data.home;
  const setHome = (next: Partial<ContentData["home"]>) => setData({ ...data, home: { ...home, ...next } });
  const nl = data.newsletter;
  const setNl = (next: Partial<ContentData["newsletter"]>) => setData({ ...data, newsletter: { ...nl, ...next } });

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveContent(data);
      setStatus({ kind: "ok", msg: "Tersimpan ✓" });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="adm-h1">Halaman Home</h1>
      <p className="adm-sub">Bagian utama yang pertama dilihat pengunjung.</p>

      <div className="adm-card">
        <h3>Hero</h3>
        <Field label="Headline (judul besar)"><TextInput value={home.headline} onChange={(v) => setHome({ headline: v })} /></Field>
        <Field label="Subline (paragraf perkenalan)"><TextArea rows={5} value={home.subline} onChange={(v) => setHome({ subline: v })} /></Field>
        <ImageUploadField label="Gambar OG / share (opsional)" subdir="uploads" value={home.image} onChange={(v) => setHome({ image: v })} aspect={16 / 9} />
      </div>

      <div className="adm-card">
        <h3>Badge "Featured" (Proyek Terbaru)</h3>
        <Toggle label="Tampilkan badge featured" checked={home.featured.display} onChange={(v) => setHome({ featured: { ...home.featured, display: v } })} />
        <div style={{ height: 10 }} />
        <Field label="Label kiri" hint='Teks di sebelah kiri. Contoh: "Latest Project"'>
          <TextInput value={home.featured.label} onChange={(v) => setHome({ featured: { ...home.featured, label: v } })} />
        </Field>
        <div className="adm-toast ok" style={{ marginTop: 4 }}>
          Proyek yang ditampilkan diisi <strong>otomatis</strong> dari proyek terbaru (tanggal paling baru).
          Tambahkan proyek baru di menu <strong>Proyek</strong>, maka badge ini ikut berubah sendiri.
        </div>
      </div>

      <div className="adm-card">
        <h3>Newsletter</h3>
        <Toggle label="Tampilkan kotak newsletter" checked={nl.display} onChange={(v) => setNl({ display: v })} />
        <div style={{ height: 10 }} />
        <Field label="Judul" hint="{firstName} otomatis diganti nama depan"><TextInput value={nl.title} onChange={(v) => setNl({ title: v })} /></Field>
        <Field label="Deskripsi"><TextArea rows={2} value={nl.description} onChange={(v) => setNl({ description: v })} /></Field>
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />
    </div>
  );
}
