"use client";

import { useEffect, useState } from "react";
import { loadContent, saveContent } from "@/components/admin/content-api";
import { ContentData, SocialLink } from "@/components/admin/types";
import { Field, Loading, SaveBar, Status, TextInput, Toggle } from "@/components/admin/ui";

// Icons available in src/resources/icons.ts
const ICONS = [
  "linkedin", "instagram", "github", "email", "x", "twitter", "threads",
  "discord", "facebook", "pinterest", "whatsapp", "reddit", "telegram",
];

export default function SocialPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    loadContent().then(setData).catch((e) => setStatus({ kind: "err", msg: String(e) }));
  }, []);

  if (!data) return <Loading />;

  const social = data.social;
  const setSocial = (next: SocialLink[]) => setData({ ...data, social: next });

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
      <h1 className="adm-h1">Media Sosial</h1>
      <p className="adm-sub">Tautan yang muncul di header dan halaman About. Untuk Email, isi link dengan <code>mailto:{"{email}"}</code>.</p>

      <div className="adm-card">
        {social.map((s, i) => (
          <div className="adm-item" key={i}>
            <div className="adm-item-head">
              <strong>Tautan #{i + 1}</strong>
              <div className="adm-item-actions">
                <button className="adm-btn sm" onClick={() => { if (i > 0) { const n = [...social]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setSocial(n); } }}>↑</button>
                <button className="adm-btn sm" onClick={() => { if (i < social.length - 1) { const n = [...social]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setSocial(n); } }}>↓</button>
                <button className="adm-btn sm danger" onClick={() => setSocial(social.filter((_, idx) => idx !== i))}>Hapus</button>
              </div>
            </div>
            <div className="adm-row">
              <Field label="Nama"><TextInput value={s.name} onChange={(v) => { const n = [...social]; n[i] = { ...s, name: v }; setSocial(n); }} /></Field>
              <Field label="Ikon">
                <select className="adm-select" value={s.icon} onChange={(e) => { const n = [...social]; n[i] = { ...s, icon: e.target.value }; setSocial(n); }}>
                  {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Tautan (link)"><TextInput value={s.link} onChange={(v) => { const n = [...social]; n[i] = { ...s, link: v }; setSocial(n); }} /></Field>
            <Toggle label="Tampilkan di halaman About (essential)" checked={s.essential} onChange={(v) => { const n = [...social]; n[i] = { ...s, essential: v }; setSocial(n); }} />
          </div>
        ))}
        <button className="adm-btn" onClick={() => setSocial([...social, { name: "", icon: "linkedin", link: "", essential: true }])}>+ Tambah tautan</button>
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />
    </div>
  );
}
