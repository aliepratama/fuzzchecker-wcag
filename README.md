![Logo FuzzChecker](fuzzchecker/images/vertical.png)

# FuzzChecker WCAG - Extension Chrome

Implementasi Fuzzy Mamdani Inference untuk pengujian aksesibilitas WCAG pada website menggunakan Chrome Extension.

## 📋 Deskripsi

FuzzChecker WCAG adalah ekstensi Chrome yang menggunakan logika fuzzy untuk mengevaluasi tingkat aksesibilitas website berdasarkan standar WCAG (Web Content Accessibility Guidelines). Ekstensi ini melakukan analisis pada dua aspek utama:

1. **Skor Aksesibilitas Kontras** - Mengevaluasi kontras warna antara background dan foreground
2. **Skor Aksesibilitas Kontekstual** - Mengevaluasi visibilitas teks berdasarkan ukuran perangkat dan ukuran font

## 🚀 Cara Instalasi

### Persyaratan
- Google Chrome Browser (versi 88 atau lebih baru)
- Chrome dengan support Manifest V3

### Langkah-langkah Instalasi

1. **Download atau Clone Repository**
   ```bash
   git clone https://github.com/username/fuzzchecker-wcag.git
   ```
   atau download sebagai ZIP dan ekstrak ke folder lokal.

2. **Buka Chrome Extension Manager**
   - Buka Google Chrome
   - Ketik `chrome://extensions/` di address bar
   - Atau melalui menu: **⋮ > More tools > Extensions**

3. **Aktifkan Developer Mode**
   - Di halaman Extensions, aktifkan toggle **"Developer mode"** di pojok kanan atas

4. **Load Extension**
   - Klik tombol **"Load unpacked"**
   - Pilih folder `fuzzchecker` dari hasil download/clone
   - Klik **"Select Folder"**

5. **Verifikasi Instalasi**
   - Extension **FuzzChecker WCAG** akan muncul di daftar extensions
   - Icon extension akan muncul di toolbar Chrome
   - Pastikan toggle extension dalam keadaan **ON**

## 📖 Cara Penggunaan

### Menjalankan Analisis

1. **Buka Website Target**
   - Navigasi ke website yang ingin dianalisis

2. **Jalankan Extension**
   - Klik icon **FuzzChecker WCAG** di toolbar Chrome
   - Extension akan otomatis menganalisis halaman yang sedang aktif

3. **Baca Hasil Analisis**
   
   **Skor Aksesibilitas Kontras:**
   - **Input**: Luminositas Background, Saturasi Background, Luminositas Foreground, Saturasi Foreground, Ukuran Heading
   - **Output**: Skor WCAG dengan kategori (AAA/AA/Gagal)
   
   **Skor Aksesibilitas Kontekstual:**
   - **Input**: Lebar Perangkat, Ukuran Heading, Ukuran Subheading
   - **Output**: Skor Visibilitas dengan kategori (Sangat Bagus/Bagus/Normal/Buruk)

### Interpretasi Hasil

#### Skor Kontras WCAG:
- **AAA** (85-100): Memenuhi standar aksesibilitas tertinggi
- **AA** (55-84): Memenuhi standar aksesibilitas minimum yang diterima
- **Gagal** (0-54): Tidak memenuhi standar aksesibilitas

#### Skor Visibilitas:
- **Sangat Bagus** (80-100): Visibilitas optimal
- **Bagus** (60-79): Visibilitas baik
- **Normal** (40-59): Visibilitas cukup
- **Buruk** (0-39): Visibilitas kurang

## 🔧 Troubleshooting

### Extension Tidak Muncul
- Pastikan Developer mode sudah diaktifkan
- Periksa apakah folder yang dipilih adalah folder `fuzzchecker` (bukan folder parent)
- Restart Chrome browser

### Hasil "Menghitung..." Terus Menerus
- Refresh halaman website yang sedang dianalisis
- Pastikan website sudah fully loaded
- Coba klik extension lagi setelah beberapa detik

### Permission Error
- Pastikan Chrome memiliki permission untuk mengakses website
- Beberapa website internal atau localhost mungkin memerlukan konfigurasi khusus

## 📁 Struktur Project

```
fuzzchecker/
├── manifest.json       # Konfigurasi extension
├── popup.html          # Interface utama extension
├── popup.css           # Styling interface
├── popup.js            # Logic utama popup
├── fuzzy.js            # Implementasi fuzzy logic
├── content.js          # Content script (opsional)
└── images/
    └── vertical.png    # Logo extension
```

## 🧮 Teknologi yang Digunakan

- **Chrome Extension API** (Manifest V3)
- **Fuzzy Mamdani Inference System**
- **JavaScript ES6+**
- **HTML5 & CSS3**

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 📞 Kontak

Jika ada pertanyaan atau saran, silakan buat issue di repository ini.

---

**Catatan**: Extension ini masih dalam tahap pengembangan. Hasil analisis dapat bervariasi tergantung pada kompleksitas website yang dianalisis.
