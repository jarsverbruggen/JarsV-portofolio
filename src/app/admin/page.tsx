"use client";

import Link from "next/link";

const CARDS = [
  { href: "/admin/profile", t: "Profil & About", d: "Nama, role, perkenalan, pengalaman, pendidikan, skill" },
  { href: "/admin/home", t: "Halaman Home", d: "Headline, deskripsi, featured, newsletter" },
  { href: "/admin/social", t: "Media Sosial", d: "Tautan LinkedIn, Instagram, Email, dll" },
  { href: "/admin/blog", t: "Blog", d: "Tulis, edit, dan hapus artikel" },
  { href: "/admin/projects", t: "Proyek", d: "Kelola portofolio / project" },
  { href: "/admin/gallery", t: "Galeri", d: "Unggah & atur foto galeri" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="adm-h1">Selamat datang 👋</h1>
      <p className="adm-sub">Pilih bagian yang ingin Anda ubah. Semua perubahan langsung tersimpan ke website.</p>
      <div className="adm-dash-grid">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="adm-dash-card">
            <div className="t">{c.t}</div>
            <div className="d">{c.d}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
