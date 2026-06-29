"use client";

import { useEffect, useRef, useState } from "react";
import { loadContent, saveContent } from "@/components/admin/content-api";
import { ContentData, GalleryImage } from "@/components/admin/types";
import { Field, Loading, SaveBar, Status, TextInput } from "@/components/admin/ui";
import { uploadImage } from "@/components/admin/ImageUploadField";
import { ImageCropper } from "@/components/admin/ImageCropper";

const GALLERY_ASPECTS = [
  { label: "Lanskap", value: 3 / 2 },
  { label: "Potret", value: 2 / 3 },
  { label: "Persegi", value: 1 },
];

function detectOrientation(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width >= img.height ? "horizontal" : "vertical");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("horizontal");
    };
    img.src = url;
  });
}

export default function GalleryPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContent().then(setData).catch((e) => setStatus({ kind: "err", msg: String(e) }));
  }, []);

  if (!data) return <Loading />;

  const images = data.gallery.images;
  const setImages = (next: GalleryImage[]) => setData({ ...data, gallery: { ...data.gallery, images: next } });

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length) setQueue(files);
  };

  const handleCropped = async (cropped: File) => {
    setQueue((q) => q.slice(1));
    setBusy(true);
    try {
      const path = await uploadImage(cropped, "gallery");
      const orientation = await detectOrientation(cropped);
      setImages([...data.gallery.images, { src: path, alt: "", orientation }]);
    } catch (err) {
      setStatus({ kind: "err", msg: err instanceof Error ? err.message : "Upload gagal" });
    } finally {
      setBusy(false);
    }
  };

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
      <h1 className="adm-h1">Galeri</h1>
      <p className="adm-sub">Unggah foto, atur posisinya, tentukan keterangan & orientasi, lalu simpan.</p>

      <div className="adm-card">
        <button className="adm-btn primary" onClick={() => fileRef.current?.click()} disabled={busy || queue.length > 0}>
          {busy ? "Mengunggah..." : "+ Unggah foto"}
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple style={{ display: "none" }} onChange={onFiles} />
        <div style={{ height: 16 }} />

        {images.map((img, i) => (
          <div className="adm-item" key={i} style={{ display: "flex", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="adm-thumb" />
            <div style={{ flex: 1 }}>
              <Field label="Keterangan (alt)"><TextInput value={img.alt} onChange={(v) => { const n = [...images]; n[i] = { ...img, alt: v }; setImages(n); }} /></Field>
              <div className="adm-row">
                <Field label="Orientasi">
                  <select className="adm-select" value={img.orientation} onChange={(e) => { const n = [...images]; n[i] = { ...img, orientation: e.target.value }; setImages(n); }}>
                    <option value="horizontal">horizontal</option>
                    <option value="vertical">vertical</option>
                  </select>
                </Field>
                <Field label="Urutan / aksi">
                  <div className="adm-item-actions">
                    <button className="adm-btn sm" onClick={() => { if (i > 0) { const n = [...images]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setImages(n); } }}>↑</button>
                    <button className="adm-btn sm" onClick={() => { if (i < images.length - 1) { const n = [...images]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setImages(n); } }}>↓</button>
                    <button className="adm-btn sm danger" onClick={() => setImages(images.filter((_, idx) => idx !== i))}>Hapus</button>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 ? <p className="adm-muted">Belum ada foto.</p> : null}
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />

      {queue.length > 0 ? (
        <ImageCropper
          file={queue[0]}
          aspectOptions={GALLERY_ASPECTS}
          onCancel={() => setQueue((q) => q.slice(1))}
          onCropped={handleCropped}
        />
      ) : null}
    </div>
  );
}
