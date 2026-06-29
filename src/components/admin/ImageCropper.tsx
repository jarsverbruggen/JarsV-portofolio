"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedFile, PixelArea } from "./cropImage";

export interface AspectOption {
  label: string;
  value: number;
}

/**
 * Modal that lets the user pan & zoom an image to frame it before upload.
 * Calls onCropped with the framed File (same name/type) when the user confirms.
 */
export function ImageCropper({
  file,
  aspect = 1,
  aspectOptions,
  onCancel,
  onCropped,
}: {
  file: File;
  aspect?: number;
  aspectOptions?: AspectOption[];
  onCancel: () => void;
  onCropped: (cropped: File) => void;
}) {
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeAspect, setActiveAspect] = useState(aspectOptions?.[0]?.value ?? aspect);
  const [areaPixels, setAreaPixels] = useState<PixelArea | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: unknown, areaPx: PixelArea) => {
    setAreaPixels(areaPx);
  }, []);

  const confirm = async () => {
    if (!areaPixels) return;
    setBusy(true);
    try {
      const cropped = await getCroppedFile(src, areaPixels, file.type, file.name);
      onCropped(cropped);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal memproses gambar");
      setBusy(false);
    }
  };

  return (
    <div className="adm-crop-overlay" role="dialog" aria-modal="true">
      <div className="adm-crop-modal">
        <div className="adm-crop-title">Atur posisi gambar</div>
        <p className="adm-muted" style={{ margin: "0 0 12px" }}>
          Geser gambar untuk memindahkan, dan gunakan slider untuk memperbesar/memperkecil.
        </p>

        {aspectOptions && aspectOptions.length > 1 ? (
          <div className="adm-crop-aspects">
            {aspectOptions.map((opt) => (
              <button
                type="button"
                key={opt.label}
                className={`adm-btn sm ${activeAspect === opt.value ? "primary" : ""}`}
                onClick={() => setActiveAspect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="adm-crop-area">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={activeAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="adm-crop-zoom">
          <span className="adm-muted">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>

        <div className="adm-crop-actions">
          <button type="button" className="adm-btn ghost" onClick={onCancel} disabled={busy}>
            Batal
          </button>
          <button type="button" className="adm-btn primary" onClick={confirm} disabled={busy || !areaPixels}>
            {busy ? "Memproses..." : "Gunakan gambar ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
