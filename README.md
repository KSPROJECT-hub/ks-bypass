# KS-BYPASS

Website pemeriksa format URL dan pendeteksi domain LootLabs. Ini bukan bypasser: aplikasi tidak mengurai tujuan tersembunyi dan tidak melewati iklan atau verifikasi.

## 1. Jalankan backend di komputer

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm start
```

API aktif di `http://localhost:3000`. Tes lewat browser: `http://localhost:3000/api/health`.

## 2. Jalankan frontend

Untuk pengujian lokal, gunakan server statis dari folder proyek, misalnya:

```bash
npx serve public
```

File `public/config.js` sudah memakai `http://localhost:3000`.

## 3. Deploy backend

1. Buat repository GitHub dan unggah semua file proyek.
2. Di Render, buat **New Web Service** dan hubungkan repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Setelah deploy, salin URL layanan Render, misalnya `https://ks-bypass-api.onrender.com`.
6. Atur environment variable `ALLOWED_ORIGIN` ke alamat GitHub Pages kamu, misalnya `https://USERNAME.github.io`.
   - Saat uji coba, `*` bisa digunakan. Untuk produksi, batasi ke origin situs sendiri.

## 4. Deploy frontend ke GitHub Pages

1. Di GitHub, buka repository → **Settings** → **Pages**.
2. Pada **Build and deployment**, pilih **Deploy from a branch**.
3. Pilih branch `main`, folder `/public`, lalu Save.
4. Buka `public/config.js` dan ubah `window.KS_API_BASE` menjadi URL backend Render, tanpa garis miring di akhir.
5. Commit perubahan. Tunggu GitHub Pages selesai menerbitkan situs.

Contoh:
```js
window.KS_API_BASE = "https://ks-bypass-api.onrender.com";
```

## Catatan fungsi

- API memvalidasi format HTTP/HTTPS dan mengenali domain LootLabs.
- API tidak melakukan request ke URL yang dikirim, sehingga tidak dapat memastikan apakah server tujuan sedang online.
- `queryHidden` hanya menandai bahwa URL memiliki query string; nilai query tidak ditampilkan atau diurai.
- Untuk pemeriksaan ketersediaan server yang aman, gunakan penyedia pemeriksaan URL tepercaya dengan kebijakan SSRF yang kuat, bukan endpoint fetch URL bebas.
