"use client";

import { useEffect, useRef, useState } from "react";
import TurndownService from "turndown";
import { marked } from "marked";
import { uploadImage } from "./ImageUploadField";

/**
 * LinkedIn-style rich text editor. The user types into a contentEditable area
 * with formatting buttons; on every change the HTML is converted to Markdown
 * (via turndown) and reported through onChange, so the stored .mdx body stays
 * plain Markdown and the public rendering pipeline is unchanged.
 */

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

function mdToHtml(md: string): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
}

export function MarkdownEditor({
  value,
  onChange,
  subdir = "uploads",
}: {
  value: string;
  onChange: (markdown: string) => void;
  subdir?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const seeded = useRef(false);
  const [uploading, setUploading] = useState(false);

  // Seed the editor once from the incoming markdown (avoids cursor jumps).
  useEffect(() => {
    if (!ref.current || seeded.current) return;
    ref.current.innerHTML = mdToHtml(value);
    seeded.current = true;
  }, [value]);

  const emit = () => {
    if (!ref.current) return;
    onChange(turndown.turndown(ref.current.innerHTML));
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Masukkan URL link:");
    if (url) exec("createLink", url);
  };

  const pickImage = () => fileRef.current?.click();

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, subdir);
      ref.current?.focus();
      document.execCommand("insertImage", false, path);
      emit();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="adm-toolbar">
        <button type="button" title="Tebal" onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" title="Miring" onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" title="Judul" onClick={() => exec("formatBlock", "h2")}>H2</button>
        <button type="button" title="Subjudul" onClick={() => exec("formatBlock", "h3")}>H3</button>
        <button type="button" title="Paragraf" onClick={() => exec("formatBlock", "p")}>¶</button>
        <button type="button" title="Daftar berpoin" onClick={() => exec("insertUnorderedList")}>• List</button>
        <button type="button" title="Daftar bernomor" onClick={() => exec("insertOrderedList")}>1. List</button>
        <button type="button" title="Link" onClick={addLink}>🔗</button>
        <button type="button" title="Sisipkan gambar" onClick={pickImage} disabled={uploading}>
          {uploading ? "..." : "🖼 Gambar"}
        </button>
      </div>
      <div
        ref={ref}
        className="adm-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={onImage}
      />
      <div className="adm-muted" style={{ marginTop: 6 }}>
        Tulis seperti biasa. Gunakan tombol di atas untuk menebalkan, membuat judul, daftar, link, atau menyisipkan gambar.
      </div>
    </div>
  );
}
