"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Login gagal");
      }
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm adm-center">
      <form className="adm-login" onSubmit={submit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="adm-brand" style={{ padding: 0, marginBottom: 18 }}>
            Panel Admin
            <small>Masuk untuk mengelola isi website</small>
          </div>
          <ThemeToggle />
        </div>
        <div className="adm-field">
          <label>Password</label>
          <input
            className="adm-input"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password admin"
          />
        </div>
        {error ? <div className="adm-toast err" style={{ marginBottom: 12 }}>{error}</div> : null}
        <button className="adm-btn primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
