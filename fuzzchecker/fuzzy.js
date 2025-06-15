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
        mobile: trapezoidalMF(width, 0, 0, 480, 767),
        tablet: triangularMF(width, 481, 768, 1023),
        desktop: trapezoidalMF(width, 769, 1024, 1920, 1920)
    };
}

// Ukuran Teks (menggunakan referensi yang lebih sederhana)
function fuzzifyTextSize(size) {
    return {
        kecil: triangularMF(size, 10, 14, 18),
        normal: triangularMF(size, 16, 22, 28),
        besar: triangularMF(size, 26, 38, 48)
    };
}

// Delta Luminositas (adaptasi dari referensi)
function fuzzifyDeltaLuminosity(deltaL) {
    return {
        buruk: triangularMF(deltaL, 0, 15, 30),
        menengah: triangularMF(deltaL, 25, 40, 55),
        bagus: triangularMF(deltaL, 50, 65, 80),
        ekstrem: triangularMF(deltaL, 75, 100, 100)
    };
}

// Saturasi Gabungan (adaptasi dari referensi)
function fuzzifySaturationCombined(saturation) {
    return {
        normal_pucat: triangularMF(saturation, 0, 25, 50),
        mencolok: triangularMF(saturation, 40, 70, 100)
    };
}

// --- Operasi Fuzzy ---
function fuzzyAnd(a, b) {
    return Math.min(a, b);
}

function fuzzyOr(a, b) {
    return Math.max(a, b);
}

// --- Defuzzifikasi menggunakan centroid sederhana ---
function defuzzifyWCAG(aaa_strength, aa_strength, gagal_strength) {
    const centers = { gagal: 20, aa: 55, aaa: 85 };
    const numerator = (gagal_strength * centers.gagal) + (aa_strength * centers.aa) + (aaa_strength * centers.aaa);
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

// --- Sistem Kontrol 1: Skor Kontras WCAG (diadaptasi dari referensi) ---
function calculateWCAGScore(luminositas_bg, luminositas_fg, saturasi_bg, saturasi_fg, ukuran_heading, ukuran_subheading) {
    // Hitung delta luminositas dan saturasi gabungan (seperti di referensi)
    const delta_l = Math.abs(luminositas_bg - luminositas_fg);
    const saturasi_gabungan = (saturasi_bg + saturasi_fg) / 2;
    const ukuran_teks_rata = (ukuran_heading + ukuran_subheading) / 2;

    // Fuzzifikasi input
    const deltaLMembership = fuzzifyDeltaLuminosity(delta_l);
    const saturasiMembership = fuzzifySaturationCombined(saturasi_gabungan);
    const ukuranTeksMembership = fuzzifyTextSize(ukuran_teks_rata);

    // Kondisi berdasarkan referensi
    const kondisi_teks_besar = ukuranTeksMembership.besar;
    const kondisi_teks_normal_kecil = fuzzyOr(ukuranTeksMembership.normal, ukuranTeksMembership.kecil);

    // Aturan-aturan berdasarkan referensi
    const ruleK1 = deltaLMembership.ekstrem; // AAA
    const ruleK2 = fuzzyAnd(deltaLMembership.bagus, kondisi_teks_besar); // AAA
    const ruleK3 = fuzzyAnd(
        fuzzyAnd(deltaLMembership.bagus, kondisi_teks_normal_kecil),
        saturasiMembership.normal_pucat
    ); // AA
    const ruleK4 = fuzzyAnd(deltaLMembership.menengah, kondisi_teks_besar); // AA
    const ruleK5 = fuzzyAnd(deltaLMembership.menengah, kondisi_teks_normal_kecil); // Gagal
    const ruleK6 = fuzzyAnd(deltaLMembership.bagus, saturasiMembership.mencolok); // Gagal
    const ruleK7 = deltaLMembership.buruk; // Gagal

    // Agregasi output
    const aaa_strength = fuzzyOr(ruleK1, ruleK2);
    const aa_strength = fuzzyOr(ruleK3, ruleK4);
    const gagal_strength = fuzzyOr(fuzzyOr(ruleK5, ruleK6), ruleK7);

    return defuzzifyWCAG(aaa_strength, aa_strength, gagal_strength);
}

// --- Sistem Kontrol 2: Visibilitas Teks (tetap menggunakan logika yang sudah baik) ---
function calculateVisibilityScore(lebar_perangkat, ukuran_heading, ukuran_subheading) {
    // Fuzzifikasi input
    const device = fuzzifyDeviceWidth(lebar_perangkat);
    const heading = fuzzifyTextSize(ukuran_heading);
    const subheading = fuzzifyTextSize(ukuran_subheading);

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