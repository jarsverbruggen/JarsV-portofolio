"use client";

import React from "react";

// Small form primitives shared across admin pages (plain HTML, styled by admin.css).

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      {children}
      {hint ? <div className="adm-muted" style={{ marginTop: 4 }}>{hint}</div> : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="adm-input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="adm-textarea"
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export type Status = { kind: "ok" | "err"; msg: string } | null;

export function SaveBar({
  onSave,
  saving,
  status,
  children,
}: {
  onSave: () => void;
  saving: boolean;
  status: Status;
  children?: React.ReactNode;
}) {
  return (
    <div className="adm-savebar">
      <button className="adm-btn primary" onClick={onSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      {children}
      {status ? <span className={`adm-toast ${status.kind}`}>{status.msg}</span> : null}
    </div>
  );
}

export function Loading() {
  return <p className="adm-muted">Memuat...</p>;
}
