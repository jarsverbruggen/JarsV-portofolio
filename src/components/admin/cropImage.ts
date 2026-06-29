// Produce a cropped image File from a source URL and a pixel crop area.

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw the selected crop area onto a canvas and return it as a File, ready to
 * upload. The output keeps the original mime type (jpeg/png/webp).
 */
export async function getCroppedFile(
  src: string,
  area: PixelArea,
  mime: string,
  filename: string,
): Promise<File> {
  const img = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const outMime = mime === "image/gif" ? "image/png" : mime;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar"))),
      outMime,
      // high quality re-encode for jpeg/webp; ignored for png (always lossless)
      0.95,
    );
  });

  return new File([blob], filename, { type: outMime });
}
