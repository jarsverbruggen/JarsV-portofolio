"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./ImageUploadField";
import { AspectOption, ImageCropper } from "./ImageCropper";

/** Manage an ordered list of image paths (upload with crop, reorder, remove). */
export function MultiImageField({
  values,
  onChange,
  subdir,
  label,
  aspect = 16 / 9,
  aspectOptions,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  subdir: string;
  label?: string;
  aspect?: number;
  aspectOptions?: AspectOption[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length) setQueue(files); // open cropper for the first file
  };

  // After cropping the current (first) file, upload it and advance the queue.
  const handleCropped = async (cropped: File) => {
    const rest = queue.slice(1);
    setQueue(rest);
    setBusy(true);
    try {
      const path = await uploadImage(cropped, subdir);
      onChange([...values, path]);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setBusy(false);
    }
  };

  const skipCurrent = () => setQueue((q) => q.slice(1));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="adm-field">
      {label ? <label>{label}</label> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        {values.map((src, i) => (
          <div key={`${src}-${i}`} style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="adm-thumb" />
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <button type="button" className="adm-btn sm" onClick={() => move(i, -1)}>←</button>
              <button type="button" className="adm-btn sm" onClick={() => move(i, 1)}>→</button>
              <button type="button" className="adm-btn sm danger" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="adm-btn sm" onClick={() => fileRef.current?.click()} disabled={busy || queue.length > 0}>
        {busy ? "Mengunggah..." : "+ Tambah gambar"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        style={{ display: "none" }}
        onChange={onFiles}
      />

      {queue.length > 0 ? (
        <ImageCropper
          file={queue[0]}
          aspect={aspect}
          aspectOptions={aspectOptions}
          onCancel={skipCurrent}
          onCropped={handleCropped}
        />
      ) : null}
    </div>
  );
}
