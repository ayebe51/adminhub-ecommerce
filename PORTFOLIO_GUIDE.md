# Panduan Portfolio & Deployment

Project AdminHub ini sudah siap untuk dijadikan bagian inti dari portfolio Anda. Berikut adalah langkah-langkah untuk mempublikasikan dan menampilkannya kepada rekruter.

## 1. Mendorong Code ke GitHub

Kirimkan kode ini ke repository publik di GitHub Anda:

```bash
git init
git add .
git commit -m "🚀 Initial commit: AdminHub Enterprise E-Commerce Portal"
git branch -M main
# Ganti URL di bawah dengan URL repo GitHub Anda
git remote add origin https://github.com/username/adminhub-ecommerce.git
git push -u origin main
```

## 2. Deploy Gratis Menggunakan Vercel (Rekomendasi)

Vercel sangat cocok untuk project Vite/React dan memberikan URL yang sangat cepat.

1. Buka [Vercel.com](https://vercel.com/) dan login dengan GitHub.
2. Klik **Add New... > Project**.
3. Import repository `adminhub-ecommerce` yang baru Anda buat.
4. Vercel akan secara otomatis mendeteksi framework (Vite).
5. Secara default, Build Command adalah `npm run build` dan Output Directory adalah `dist`.
6. Klik **Deploy**. Dalam ~1 menit, aplikasi Anda akan live.

*(Alternatif: Netlify juga memiliki proses persis sama)*

## 3. Tambahkan ke LinkedIn / CV Anda

Gunakan teks berikut untuk mendeskripsikan project di CV atau LinkedIn Anda:

> **AdminHub - High-Performance E-Commerce Admin Portal**
> Frontend Architect | React, TypeScript, AG Grid, Zustand
> *   Designed and implemented a scalable admin portal capable of handling **10,000+ data rows** smoothly using chunking and virtualization (AG Grid).
> *   Engineered an atomic **Bulk Operations Engine** featuring an immutable Undo/Redo stack leveraging Zustand and Immer.
> *   Built a dynamic **Promotion Rule Engine** allowing non-technical users to compose complex Boolean business logic with real-time cart previews.
> *   Integrated timeline-based **Audit Trails** and runtime **Feature Flags** to simulate true enterprise operational controls.

## 4. Tips Wawancara (Interview)

Jika ditanya mengenai project ini, bersiaplah untuk membahas:
*   **Mengapa AG Grid?** Jelaskan limitasi HTML table biasa saat me-render DOM node dalam jumlah masif (10.000 element), dan bagaimana virtualization menyelesaikan masalah memory/FPS.
*   **Cara kerja Undo/Redo?** Jelaskan pola `Command Pattern` atau bagaimana `Immer` menciptakan *snapshot* immutable dari *State* sebelumnya.
*   **Arsitektur Route:** Ceritakan cara Vite dan React 19 melakukan *Code Splitting* di level Route untuk mengurangi bundle-size awal dashboard.
