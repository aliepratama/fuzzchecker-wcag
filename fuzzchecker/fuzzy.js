// Konversi RGB ke HSL (Hue, Saturation, Luminosity)
function rgbToHsl(rgbString) {
    let [r, g, b] = rgbString.match(/\d+/g).map(Number);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

// --- Fungsi Keanggotaan (Membership Functions) ---
// Fungsi segitiga
function triangularMF(x, a, b, c) {
    if (x <= a || x >= c) return 0;
    if (x > a && x <= b) return (x - a) / (b - a);
    if (x > b && x < c) return (c - x) / (c - b);
    return 0;
}

// Fungsi trapesium
function trapezoidalMF(x, a, b, c, d) {
    if (x <= a || x >= d) return 0;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x >= b && x <= c) return 1;
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
}

// --- Membership Functions untuk setiap variabel ---

// Lebar Perangkat
function fuzzifyDeviceWidth(width) {
    return {
        mobile: trapezoidalMF(width, 0, 0, 360, 767),
        tablet: triangularMF(width, 361, 768, 1023),
        desktop: trapezoidalMF(width, 769, 1024, 1920, 1920)
    };
}

// Ukuran Teks
function fuzzifyTextSize(size, type = 'heading') {
    if (type === 'heading') {
        return {
            kecil: trapezoidalMF(size, 12, 12, 16, 23),
            normal: triangularMF(size, 18, 24, 35),
            besar: trapezoidalMF(size, 30, 36, 48, 48)
        };
    } else { // subheading
        return {
            kecil: trapezoidalMF(size, 10, 10, 14, 17),
            normal: triangularMF(size, 14, 18, 23),
            besar: trapezoidalMF(size, 20, 24, 36, 36)
        };
    }
}

// Luminositas (0-100)
function fuzzifyLuminosity(luminosity) {
    return {
        hitam: triangularMF(luminosity, 0, 0, 10),
        sangat_gelap: triangularMF(luminosity, 5, 15, 25),
        gelap: triangularMF(luminosity, 20, 30, 40),
        agak_gelap: triangularMF(luminosity, 35, 45, 55),
        normal: triangularMF(luminosity, 50, 60, 70),
        agak_terang: triangularMF(luminosity, 65, 75, 85),
        terang: triangularMF(luminosity, 80, 85, 90),
        sangat_terang: triangularMF(luminosity, 88, 93, 98),
        putih: triangularMF(luminosity, 95, 100, 100)
    };
}

// Saturasi (0-100)
function fuzzifySaturation(saturation) {
    return {
        pucat: triangularMF(saturation, 0, 0, 50),
        normal: triangularMF(saturation, 0, 50, 100),
        mencolok: triangularMF(saturation, 50, 100, 100)
    };
}

// --- Operasi Fuzzy ---
function fuzzyAnd(a, b) {
    return Math.min(a, b);
}

function fuzzyOr(a, b) {
    return Math.max(a, b);
}

// --- Sistem Kontrol 1: Skor Kontras WCAG ---
function calculateWCAGScore(luminositas_bg, luminositas_fg, saturasi_bg, saturasi_fg, ukuran_heading, ukuran_subheading) {
    // Fuzzifikasi input
    const lumi_bg = fuzzifyLuminosity(luminositas_bg);
    const lumi_fg = fuzzifyLuminosity(luminositas_fg);
    const sat_bg = fuzzifySaturation(saturasi_bg);
    const sat_fg = fuzzifySaturation(saturasi_fg);
    const heading = fuzzifyTextSize(ukuran_heading, 'heading');
    const subheading = fuzzifyTextSize(ukuran_subheading, 'subheading');

    // Kondisi yang didefinisikan
    const kondisi_kontras_ekstrem = fuzzyOr(
        fuzzyAnd(
            fuzzyOr(lumi_bg.hitam, lumi_bg.sangat_gelap),
            fuzzyOr(lumi_fg.putih, lumi_fg.sangat_terang)
        ),
        fuzzyAnd(
            fuzzyOr(lumi_bg.putih, lumi_bg.sangat_terang),
            fuzzyOr(lumi_fg.hitam, lumi_fg.sangat_gelap)
        )
    );

    const kondisi_kontras_bagus = fuzzyOr(
        fuzzyAnd(lumi_bg.gelap, lumi_fg.terang),
        fuzzyAnd(lumi_bg.terang, lumi_fg.gelap)
    );

    const kondisi_kontras_menengah = fuzzyOr(
        fuzzyAnd(lumi_bg.agak_gelap, lumi_fg.agak_terang),
        fuzzyAnd(lumi_bg.agak_terang, lumi_fg.agak_gelap)
    );

    const kondisi_kontras_buruk = fuzzyOr(
        fuzzyAnd(lumi_bg.normal, lumi_fg.normal),
        fuzzyAnd(lumi_bg.gelap, lumi_bg.agak_gelap)
    );

    const kondisi_teks_besar = fuzzyOr(heading.besar, subheading.besar);
    const kondisi_teks_normal = fuzzyOr(heading.normal, subheading.normal);
    const kondisi_teks_kecil = fuzzyOr(heading.kecil, subheading.kecil);

    // Aturan-aturan
    const rule_k1 = kondisi_kontras_ekstrem; // AAA
    const rule_k2 = fuzzyAnd(kondisi_kontras_bagus, kondisi_teks_besar); // AAA
    const rule_k3 = fuzzyAnd(
        fuzzyAnd(kondisi_kontras_bagus, kondisi_teks_normal),
        fuzzyOr(sat_bg.normal, sat_bg.pucat)
    ); // AA
    const rule_k4 = fuzzyAnd(kondisi_kontras_menengah, kondisi_teks_besar); // AA
    const rule_k5 = fuzzyAnd(kondisi_kontras_menengah, fuzzyOr(kondisi_teks_normal, kondisi_teks_kecil)); // Gagal
    const rule_k6 = fuzzyAnd(
        fuzzyAnd(fuzzyAnd(kondisi_kontras_bagus, kondisi_teks_normal), sat_bg.mencolok),
        sat_fg.mencolok
    ); // Gagal
    const rule_k7 = kondisi_kontras_buruk; // Gagal

    // Agregasi output
    const aaa_strength = fuzzyOr(rule_k1, rule_k2);
    const aa_strength = fuzzyOr(rule_k3, rule_k4);
    const gagal_strength = fuzzyOr(fuzzyOr(rule_k5, rule_k6), rule_k7);

    // Defuzzifikasi menggunakan centroid sederhana
    const centers = { Gagal: 25, AA: 67.5, AAA: 92.5 };
    const numerator = (gagal_strength * centers.Gagal) + (aa_strength * centers.AA) + (aaa_strength * centers.AAA);
    const denominator = gagal_strength + aa_strength + aaa_strength;

    if (denominator === 0) return { score: 0, category: 'Gagal' };

    const score = numerator / denominator;
    
    // Tentukan kategori berdasarkan strength tertinggi
    let category = 'Gagal';
    if (aaa_strength > aa_strength && aaa_strength > gagal_strength) {
        category = 'AAA';
    } else if (aa_strength > gagal_strength) {
        category = 'AA';
    }

    return { score: Math.round(score * 100) / 100, category };
}

// --- Sistem Kontrol 2: Visibilitas Teks ---
function calculateVisibilityScore(lebar_perangkat, ukuran_heading, ukuran_subheading) {
    // Fuzzifikasi input
    const device = fuzzifyDeviceWidth(lebar_perangkat);
    const heading = fuzzifyTextSize(ukuran_heading, 'heading');
    const subheading = fuzzifyTextSize(ukuran_subheading, 'subheading');

    const kondisi_teks_besar = fuzzyOr(heading.besar, subheading.besar);
    const kondisi_teks_normal = fuzzyOr(heading.normal, subheading.normal);
    const kondisi_teks_kecil = fuzzyOr(heading.kecil, subheading.kecil);

    // Aturan-aturan
    const rule_t1 = fuzzyAnd(device.desktop, kondisi_teks_besar); // sangat_bagus
    const rule_t2 = fuzzyAnd(device.desktop, kondisi_teks_normal); // bagus
    const rule_t3 = fuzzyAnd(device.tablet, fuzzyOr(kondisi_teks_besar, kondisi_teks_normal)); // bagus
    const rule_t4 = fuzzyAnd(device.mobile, fuzzyOr(kondisi_teks_besar, kondisi_teks_normal)); // normal
    const rule_t5 = fuzzyAnd(fuzzyOr(device.desktop, device.tablet), kondisi_teks_kecil); // normal
    const rule_t6 = fuzzyAnd(device.mobile, kondisi_teks_kecil); // buruk

    // Agregasi output
    const sangat_bagus_strength = rule_t1;
    const bagus_strength = fuzzyOr(rule_t2, rule_t3);
    const normal_strength = fuzzyOr(rule_t4, rule_t5);
    const buruk_strength = rule_t6;

    // Defuzzifikasi
    const centers = { buruk: 16.5, normal: 49.5, bagus: 82.5, sangat_bagus: 83 };
    const numerator = (buruk_strength * centers.buruk) + (normal_strength * centers.normal) + 
                     (bagus_strength * centers.bagus) + (sangat_bagus_strength * centers.sangat_bagus);
    const denominator = buruk_strength + normal_strength + bagus_strength + sangat_bagus_strength;

    if (denominator === 0) return { score: 0, category: 'buruk' };

    const score = numerator / denominator;
    
    // Tentukan kategori berdasarkan strength tertinggi
    let category = 'buruk';
    const strengths = [
        { name: 'sangat_bagus', value: sangat_bagus_strength },
        { name: 'bagus', value: bagus_strength },
        { name: 'normal', value: normal_strength },
        { name: 'buruk', value: buruk_strength }
    ];
    
    const maxStrength = strengths.reduce((max, current) => 
        current.value > max.value ? current : max
    );
    category = maxStrength.name;

    return { score: Math.round(score * 100) / 100, category };
}

// --- Fungsi utama untuk menjalankan analisis fuzzy lengkap ---
function analyzeFuzzyWCAG(inputs) {
    const {
        luminositas_bg,
        luminositas_fg,
        saturasi_bg,
        saturasi_fg,
        ukuran_heading,
        ukuran_subheading,
        lebar_perangkat
    } = inputs;

    const contrastResult = calculateWCAGScore(
        luminositas_bg, luminositas_fg, saturasi_bg, 
        saturasi_fg, ukuran_heading, ukuran_subheading
    );

    const visibilityResult = calculateVisibilityScore(
        lebar_perangkat, ukuran_heading, ukuran_subheading
    );

    return {
        contrast: contrastResult,
        visibility: visibilityResult
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        rgbToHsl,
        analyzeFuzzyWCAG,
        calculateWCAGScore,
        calculateVisibilityScore
    };
}