@echo off
REM ============================================================
REM  Buka Panel Admin website (mode lokal)
REM  Klik dua kali file ini untuk mulai mengedit website Anda.
REM ============================================================

cd /d "%~dp0"

echo.
echo  Menyalakan server lokal...
echo  Setelah muncul tulisan "Ready", browser akan terbuka otomatis.
echo  JANGAN tutup jendela hitam ini selama Anda mengedit.
echo.

REM Buka halaman admin di browser setelah jeda singkat
start "" cmd /c "timeout /t 6 >nul && start http://localhost:3000/admin"

REM Jalankan server pengembangan Next.js
call npm run dev
