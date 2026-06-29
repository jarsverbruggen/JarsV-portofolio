"use client";

import { useEffect, useState } from "react";
import { loadContent, saveContent } from "@/components/admin/content-api";
import { ContentData, Experience, Institution, Skill } from "@/components/admin/types";
import { Field, Loading, SaveBar, Status, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { MultiImageField } from "@/components/admin/MultiImageField";

export default function ProfilePage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    loadContent().then(setData).catch((e) => setStatus({ kind: "err", msg: String(e) }));
  }, []);

  if (!data) return <Loading />;

  const p = data.person;
  const set = (next: Partial<ContentData>) => setData({ ...data, ...next });
  const setPerson = (k: keyof ContentData["person"], v: unknown) =>
    set({ person: { ...p, [k]: v } });
  const about = data.about;
  const setAbout = (next: Partial<ContentData["about"]>) => set({ about: { ...about, ...next } });

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

  // ---- repeatable helpers ----
  const exps = about.work.experiences;
  const setExps = (next: Experience[]) => setAbout({ work: { ...about.work, experiences: next } });
  const insts = about.studies.institutions;
  const setInsts = (next: Institution[]) =>
    setAbout({ studies: { ...about.studies, institutions: next } });
  const skills = about.technical.skills;
  const setSkills = (next: Skill[]) =>
    setAbout({ technical: { ...about.technical, skills: next } });

  return (
    <div>
      <h1 className="adm-h1">Profil & About</h1>
      <p className="adm-sub">Informasi diri yang tampil di seluruh website serta halaman About.</p>

      <div className="adm-card">
        <h3>Data Diri</h3>
        <ImageUploadField
          label="Foto profil"
          subdir="avatar"
          value={p.avatar}
          onChange={(v) => setPerson("avatar", v)}
        />
        <div className="adm-row">
          <Field label="Nama depan"><TextInput value={p.firstName} onChange={(v) => setPerson("firstName", v)} /></Field>
          <Field label="Nama belakang"><TextInput value={p.lastName} onChange={(v) => setPerson("lastName", v)} /></Field>
        </div>
        <Field label="Nama tampilan"><TextInput value={p.name} onChange={(v) => setPerson("name", v)} /></Field>
        <Field label="Role / profesi"><TextInput value={p.role} onChange={(v) => setPerson("role", v)} /></Field>
        <div className="adm-row">
          <Field label="Email"><TextInput value={p.email} onChange={(v) => setPerson("email", v)} /></Field>
          <Field label="Lokasi (zona waktu)" hint="Contoh: Asia/Jakarta"><TextInput value={p.location} onChange={(v) => setPerson("location", v)} /></Field>
        </div>
        <Field label="Bahasa" hint="Pisahkan dengan koma">
          <TextInput
            value={p.languages.join(", ")}
            onChange={(v) => setPerson("languages", v.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      </div>

      <div className="adm-card">
        <h3>Perkenalan (Introduction)</h3>
        <Toggle label="Tampilkan bagian ini" checked={about.intro.display} onChange={(v) => setAbout({ intro: { ...about.intro, display: v } })} />
        <div style={{ height: 10 }} />
        <Field label="Judul"><TextInput value={about.intro.title} onChange={(v) => setAbout({ intro: { ...about.intro, title: v } })} /></Field>
        <Field label="Paragraf perkenalan">
          <TextArea rows={6} value={about.intro.description} onChange={(v) => setAbout({ intro: { ...about.intro, description: v } })} />
        </Field>
      </div>

      <div className="adm-card">
        <h3>Pengalaman (Experience)</h3>
        <Toggle label="Tampilkan bagian ini" checked={about.work.display} onChange={(v) => setAbout({ work: { ...about.work, display: v } })} />
        <Field label="Judul bagian"><TextInput value={about.work.title} onChange={(v) => setAbout({ work: { ...about.work, title: v } })} /></Field>

        {exps.map((exp, i) => (
          <div className="adm-item" key={i}>
            <div className="adm-item-head">
              <strong>Pengalaman #{i + 1}</strong>
              <div className="adm-item-actions">
                <button className="adm-btn sm" onClick={() => { if (i > 0) { const n = [...exps]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setExps(n); } }}>↑</button>
                <button className="adm-btn sm" onClick={() => { if (i < exps.length - 1) { const n = [...exps]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setExps(n); } }}>↓</button>
                <button className="adm-btn sm danger" onClick={() => setExps(exps.filter((_, idx) => idx !== i))}>Hapus</button>
              </div>
            </div>
            <div className="adm-row">
              <Field label="Perusahaan / penyelenggara"><TextInput value={exp.company} onChange={(v) => { const n = [...exps]; n[i] = { ...exp, company: v }; setExps(n); }} /></Field>
              <Field label="Periode"><TextInput value={exp.timeframe} onChange={(v) => { const n = [...exps]; n[i] = { ...exp, timeframe: v }; setExps(n); }} /></Field>
            </div>
            <Field label="Jabatan / nama program"><TextInput value={exp.role} onChange={(v) => { const n = [...exps]; n[i] = { ...exp, role: v }; setExps(n); }} /></Field>
            <Field label="Poin pencapaian (satu baris satu poin)">
              <TextArea rows={3} value={exp.achievements.join("\n")} onChange={(v) => { const n = [...exps]; n[i] = { ...exp, achievements: v.split("\n").map((s) => s.trim()).filter(Boolean) }; setExps(n); }} />
            </Field>
            <MultiImageField label="Gambar (opsional)" subdir="projects" values={exp.images} onChange={(v) => { const n = [...exps]; n[i] = { ...exp, images: v }; setExps(n); }} />
          </div>
        ))}
        <button className="adm-btn" onClick={() => setExps([...exps, { company: "", timeframe: "", role: "", achievements: [], images: [] }])}>+ Tambah pengalaman</button>
      </div>

      <div className="adm-card">
        <h3>Pendidikan (Education)</h3>
        <Toggle label="Tampilkan bagian ini" checked={about.studies.display} onChange={(v) => setAbout({ studies: { ...about.studies, display: v } })} />
        <Field label="Judul bagian"><TextInput value={about.studies.title} onChange={(v) => setAbout({ studies: { ...about.studies, title: v } })} /></Field>
        {insts.map((inst, i) => (
          <div className="adm-item" key={i}>
            <div className="adm-item-head">
              <strong>Pendidikan #{i + 1}</strong>
              <div className="adm-item-actions">
                <button className="adm-btn sm danger" onClick={() => setInsts(insts.filter((_, idx) => idx !== i))}>Hapus</button>
              </div>
            </div>
            <Field label="Nama institusi"><TextInput value={inst.name} onChange={(v) => { const n = [...insts]; n[i] = { ...inst, name: v }; setInsts(n); }} /></Field>
            <Field label="Deskripsi"><TextArea rows={3} value={inst.description} onChange={(v) => { const n = [...insts]; n[i] = { ...inst, description: v }; setInsts(n); }} /></Field>
          </div>
        ))}
        <button className="adm-btn" onClick={() => setInsts([...insts, { name: "", description: "" }])}>+ Tambah pendidikan</button>
      </div>

      <div className="adm-card">
        <h3>Skill Teknis</h3>
        <Toggle label="Tampilkan bagian ini" checked={about.technical.display} onChange={(v) => setAbout({ technical: { ...about.technical, display: v } })} />
        <Field label="Judul bagian"><TextInput value={about.technical.title} onChange={(v) => setAbout({ technical: { ...about.technical, title: v } })} /></Field>
        {skills.map((skill, i) => (
          <div className="adm-item" key={i}>
            <div className="adm-item-head">
              <strong>Kategori skill #{i + 1}</strong>
              <div className="adm-item-actions">
                <button className="adm-btn sm danger" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>Hapus</button>
              </div>
            </div>
            <Field label="Nama kategori"><TextInput value={skill.title} onChange={(v) => { const n = [...skills]; n[i] = { ...skill, title: v }; setSkills(n); }} /></Field>
            <Field label="Deskripsi singkat"><TextArea rows={2} value={skill.description} onChange={(v) => { const n = [...skills]; n[i] = { ...skill, description: v }; setSkills(n); }} /></Field>
            <Field label="Daftar skill (pisahkan dengan koma)">
              <TextInput
                value={skill.tags.map((t) => t.name).join(", ")}
                onChange={(v) => { const n = [...skills]; n[i] = { ...skill, tags: v.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name })) }; setSkills(n); }}
              />
            </Field>
          </div>
        ))}
        <button className="adm-btn" onClick={() => setSkills([...skills, { title: "", description: "", tags: [], images: [] }])}>+ Tambah kategori skill</button>
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />
    </div>
  );
}
