![Logo FuzzChecker](https://i.ibb.co/RT0Q9JGm/vertical.png)

# Sistem Penilaian Aksesibilitas Desain berbasis Fuzzy

Aplikasi web interaktif untuk mengevaluasi aksesibilitas desain antarmuka (kontras warna dan keterbacaan teks) secara *real-time* menggunakan sistem inferensi fuzzy Mamdani.

-----

## 📋 Deskripsi

Proyek ini adalah sebuah aplikasi web yang dibangun dengan Next.js dan berfungsi sebagai alat bantu bagi desainer dan developer. Tujuannya adalah untuk mengukur tingkat aksesibilitas desain secara objektif sebelum diimplementasikan.

Aplikasi ini menggunakan **Logika Fuzzy** untuk menangani ambiguitas dalam penilaian desain (seperti "ukuran teks yang 'cukup' besar" atau "kontras yang 'baik'"). Analisis dilakukan pada dua aspek utama:

1.  **Skor Aksesibilitas Kontras** - Mengevaluasi kontras warna antara latar belakang dan teks depan berdasarkan standar WCAG.
2.  **Skor Visibilitas Teks** - Mengevaluasi keterbacaan teks berdasarkan ukuran perangkat (desktop/mobile) dan ukuran font yang digunakan.

Seluruh aplikasi berjalan dalam satu lingkungan Next.js (full-stack) tanpa memerlukan server backend terpisah.

<br/>

> ✨ **Tersedia Juga Versi Ekstensi Chrome\!**
>
> Untuk kemudahan integrasi dalam alur kerja Anda, proyek ini juga tersedia dalam bentuk Ekstensi Chrome. Cek repositorinya di sini:
>
> **[FuzzChecker WCAG for Chrome](https://github.com/aliepratama/fuzzchecker-wcag/tree/chrome-extension)**

<br/>

## 🚀 Cara Instalasi dan Menjalankan

### Persyaratan

  - **Node.js** (versi 18.17 atau lebih baru)
  - **npm** atau **yarn**

### Langkah-langkah Instalasi

1.  **Download atau Clone Repository**

    ```bash
    git clone https://github.com/username/project-aksesibilitas-fuzzy.git
    ```

    atau download sebagai ZIP dan ekstrak ke folder lokal.

2.  **Masuk ke Direktori Proyek**

    ```bash
    cd project-aksesibilitas-fuzzy
    ```

3.  **Instal Dependensi**
    Jalankan perintah berikut untuk menginstal semua library yang dibutuhkan.

    ```bash
    npm install
    ```

4.  **Jalankan Server Pengembangan**

    ```bash
    npm run dev
    ```

5.  **Buka Aplikasi**

      - Buka browser Anda dan kunjungi **http://localhost:3000**.
      - Aplikasi siap digunakan.

## 📖 Cara Penggunaan

### Menjalankan Analisis

Aplikasi ini bekerja secara **real-time dengan jeda (debouncing)**.

1.  **Buka Aplikasi** di browser.
2.  **Ubah Input**: Lakukan perubahan pada pilihan warna atau ukuran teks di panel "Pengaturan Desain".
3.  **Lihat Hasil**: Setelah Anda berhenti melakukan perubahan selama **2 detik**, sistem akan otomatis memproses input dan menampilkan hasilnya di panel "Hasil Penilaian".

### Interpretasi Hasil

**Skor Aksesibilitas Kontras (WCAG):**

  - **Input**: Warna Teks, Warna Latar, Ukuran Teks.
  - **Output**:
      - **AAA**: Memenuhi standar aksesibilitas tertinggi.
      - **AA**: Memenuhi standar aksesibilitas minimum yang diterima.
      - **Gagal**: Tidak memenuhi standar aksesibilitas.

**Skor Visibilitas Teks:**

  - **Input**: Lebar Perangkat (diambil dari lebar browser), Ukuran Teks.
  - **Output**:
      - **Bagus**: Visibilitas sangat baik dan nyaman dibaca.
      - **Normal**: Visibilitas cukup, dapat diterima.
      - **Buruk**: Visibilitas kurang, sulit dibaca.

## 🔧 Troubleshooting

### Aplikasi Gagal Berjalan

  - Pastikan versi Node.js Anda sesuai dengan persyaratan.
  - Jalankan `npm install` kembali untuk memastikan semua dependensi terpasang dengan benar.

### Hasil Tidak Muncul

  - Refresh halaman browser.
  - Buka Developer Tools (F12) dan periksa tab "Console" untuk melihat apakah ada pesan error saat pemanggilan API.
  - Pastikan file di `src/app/api/evaluate/route.js` tidak memiliki error.

### Error CORS (Meskipun tidak seharusnya terjadi)

  - Karena frontend dan API berada di domain yang sama (Next.js), error CORS seharusnya tidak terjadi. Jika ada, pastikan panggilan `fetch` di `page.jsx` menggunakan path relatif (`/api/evaluate`).

## 📁 Struktur Project

```
project-aksesibilitas-fuzzy/
├── public/                  # Aset statis
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── evaluate/
│   │   │       └── route.js    # Backend: Endpoint API logika fuzzy
│   │   ├── globals.css         # Styling global Tailwind
│   │   ├── layout.jsx          # Layout utama & font
│   │   └── page.jsx            # Komponen utama halaman (otak frontend)
│   │
│   ├── components/
│   │   ├── InputSection.jsx    # Panel input
│   │   ├── PreviewSection.jsx  # Panel pratinjau
│   │   └── ResultSection.jsx   # Panel hasil
│   │
│   └── utils/
│       └── fuzzy.js            # Modul logika fuzzy Mamdani dalam JS
│
├── package.json
└── ...
```

## 🧮 Teknologi yang Digunakan

  - **Next.js**: React Framework (Frontend & Backend)
  - **React.js**: Library untuk membangun antarmuka pengguna
  - **Tailwind CSS**: Framework CSS untuk styling
  - **Culori**: Library JavaScript untuk manipulasi warna
  - **Lucide React**: Library ikon
  - **Logika Fuzzy Mamdani**: Diimplementasikan secara native di JavaScript.

## 🤝 Kontribusi

Kontribusi sangat diterima\! Silakan:

1.  Fork repository ini.
2.  Buat feature branch (`git checkout -b feature/FiturBaru`).
3.  Commit perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`).
4.  Push ke branch (`git push origin feature/FiturBaru`).
5.  Buat Pull Request baru.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://www.google.com/search?q=LICENSE).