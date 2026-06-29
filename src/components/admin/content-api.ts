import type { ContentData } from "./types";

export async function loadContent(): Promise<ContentData> {
  const res = await fetch("/api/admin/content", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat konten");
  return (await res.json()) as ContentData;
}

export async function saveContent(data: ContentData): Promise<void> {
  const res = await fetch("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || "Gagal menyimpan");
  }
}
