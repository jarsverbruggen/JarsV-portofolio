# Panduan Panel Admin (CMS Lokal)

Panel admin memungkinkan Anda mengubah seluruh isi website **lewat form**, tanpa membuka
kode dan tanpa tahu pemrograman. Semua perubahan tersimpan langsung ke file website Anda.

---

## 1. Cara membuka panel admin

**Cara mudah (klik dua kali):**

1. Buka folder project.
2. Klik dua kali file **`start-admin.bat`**.
3. Jendela hitam akan terbuka. Tunggu sampai muncul tulisan **Ready** / **compiled**.
   Browser akan otomatis membuka `http://localhost:3000/admin`.
4. **Jangan tutup jendela hitam itu** selama Anda mengedit.

**Cara manual (lewat terminal):**

```bash
npm run dev
```

lalu buka di browser: `http://localhost:3000/admin`

---

## 2. Login

- Masukkan password admin.
- Password diatur di file **`.env.local`** pada baris `ADMIN_PASSWORD=...`.
- Password awal: **`admin123`** — sangat disarankan untuk **menggantinya**.
  Buka `.env.local`, ubah nilainya, simpan, lalu jalankan ulang `start-admin.bat`.

---

## 3. Apa saja yang bisa diedit

| Menu | Isi |
|------|-----|
| **Profil & About** | Nama, role, foto, perkenalan, pengalaman, pendidikan, skill |
| **Halaman Home** | Headline, paragraf perkenalan, badge featured, newsletter |
| **Media Sosial** | Tautan LinkedIn, Instagram, Email, dll |
| **Blog** | Tulis, edit, hapus artikel |
| **Proyek** | Kelola portofolio/proyek |
| **Galeri** | Unggah & atur foto |

Setelah mengubah, klik tombol **Simpan**. Perubahan langsung muncul di website
(buka tab `http://localhost:3000` untuk melihat hasilnya — tekan refresh bila perlu).

---

## 4. Menulis artikel / proyek (seperti menulis biasa)

Di bagian **Isi Artikel** ada kotak editor dengan tombol di atasnya:

- **B** = tebal, **I** = miring
- **H2 / H3** = judul & subjudul
- **• List / 1. List** = daftar
- **🔗** = sisipkan link
- **🖼 Gambar** = unggah & sisipkan gambar langsung di tengah tulisan

Cukup ketik seperti biasa, lalu gunakan tombol untuk memformat. Tidak perlu tahu kode.

---

## 5. Menambahkan gambar

- **Foto profil:** menu Profil & About → "Foto profil" → Unggah.
- **Gambar sampul artikel:** di form artikel → "Gambar sampul".
- **Gambar proyek:** di form proyek → "Gambar proyek" (bisa banyak).
- **Foto galeri:** menu Galeri → "Unggah foto".

Semua gambar otomatis tersimpan di folder `public/images/`.

---

## 6. Menerbitkan ke internet (publish)

Panel admin ini bekerja **di komputer Anda (lokal)**. Untuk membuat perubahan tampil
di website online:

1. Pastikan semua perubahan sudah disimpan lewat panel admin.
2. Unggah/deploy ulang project ke hosting Anda (mis. Vercel) — atau commit & push bila
   memakai Git + Vercel.

> Catatan: di hosting seperti Vercel, panel admin **tidak bisa menyimpan** (penyimpanan
> di server bersifat sementara). Karena itu, selalu **edit di lokal lalu publish**.

---

## 7. Keamanan

- Panel admin hanya untuk dipakai di komputer Anda. Jangan bagikan password.
- Saat website sudah online (production), fungsi simpan/edit otomatis dimatikan demi keamanan.
- Ganti `ADMIN_PASSWORD` di `.env.local` dengan password yang kuat.

---

Selamat mengedit! 🎉
