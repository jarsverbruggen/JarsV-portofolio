"use client";

import { useRef, useState } from "react";
import { AspectOption, ImageCropper } from "./ImageCropper";

/** Upload an image to /api/admin/upload and return its /images/... path. */
export async function uploadImage(file: File, subdir: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("subdir", subdir);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Upload gagal");
  return data.path as string;
}

export function ImageUploadField({
  value,
  onChange,
  subdir,
  label,
  aspect = 1,
  aspectOptions,
}: {
  value: string;
  onChange: (path: string) => void;
  subdir: string;
  label?: string;
  aspect?: number;
  aspectOptions?: AspectOption[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState<File | null>(null);

  const pick = () => inputRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(undefined);
    setPending(file); // open the cropper
  };

  const handleCropped = async (cropped: File) => {
    setPending(null);
    setBusy(true);
    try {
      const path = await uploadImage(cropped, subdir);
      onChange(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-field">
      {label ? <label>{label}</label> : null}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="preview" className="adm-thumb" />
        ) : (
          <div className="adm-thumb" />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button type="button" className="adm-btn sm" onClick={pick} disabled={busy}>
            {busy ? "Mengunggah..." : value ? "Ganti gambar" : "Unggah gambar"}
          </button>
          {value ? (
            <button type="button" className="adm-btn sm ghost" onClick={() => onChange("")}>
              Hapus
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={onFile}
        />
      </div>
      {value ? <div className="adm-muted" style={{ marginTop: 6 }}>{value}</div> : null}
      {error ? <div className="adm-toast err" style={{ marginTop: 6 }}>{error}</div> : null}

      {pending ? (
        <ImageCropper
          file={pending}
          aspect={aspect}
          aspectOptions={aspectOptions}
          onCancel={() => setPending(null)}
          onCropped={handleCropped}
        />
      ) : null}
    </div>
  );
}
