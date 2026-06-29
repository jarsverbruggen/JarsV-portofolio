"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminLogin } from "./AdminLogin";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profil & About" },
  { href: "/admin/home", label: "Halaman Home" },
  { href: "/admin/social", label: "Media Sosial" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/projects", label: "Proyek" },
  { href: "/admin/gallery", label: "Galeri" },
];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // close the mobile/tablet drawer whenever the route changes
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/check", { cache: "no-store" });
      setState(res.ok ? "in" : "out");
    } catch {
      setState("out");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setState("out");
    router.push("/admin");
  };

  if (state === "loading") {
    return (
      <div className="adm adm-center">
        <p className="adm-muted">Memuat...</p>
      </div>
    );
  }

  if (state === "out") {
    return <AdminLogin onSuccess={check} />;
  }

  return (
    <div className="adm">
      <button
        className="adm-menu-btn"
        onClick={() => setNavOpen(true)}
        aria-label="Buka menu"
      >
        ☰
      </button>
      <div className={`adm-shell${navOpen ? " nav-open" : ""}`}>
        <div className="adm-backdrop" onClick={() => setNavOpen(false)} />
        <aside className="adm-side">
          <button
            className="adm-side-close"
            onClick={() => setNavOpen(false)}
            aria-label="Tutup menu"
          >
            ✕
          </button>
          <div className="adm-brand">
            Panel Admin
            <small>Kelola isi website</small>
          </div>
          <nav className="adm-nav">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="adm-side-foot">
            <hr className="adm-hr" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="adm-muted">Tema</span>
              <ThemeToggle />
            </div>
            <a href="/" target="_blank" rel="noreferrer" className="adm-btn ghost sm" style={{ display: "block", textAlign: "center", marginBottom: 8 }}>
              Lihat website ↗
            </a>
            <button className="adm-btn ghost sm" onClick={logout} style={{ width: "100%" }}>
              Keluar
            </button>
          </div>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </div>
  );
}
