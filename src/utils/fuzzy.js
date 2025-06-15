// src/utils/fuzzy.js

import { hsl } from 'culori';

// ===================================================================
//                 BAGIAN 1: FUNGSI BANTUAN
// ===================================================================

/**
 * Mengonversi warna HEX ke objek HSL.
 * @param {string} hexColor - Warna dalam format HEX (misal: '#FFFFFF').
 * @returns {{h: number, s: number, l: number}} - Objek HSL dengan s dan l dalam skala 0-100.
 */
function hexToHsl(hexColor) {
  const color = hsl(hexColor);
  if (!color) return { h: 0, s: 0, l: 0 };
  // Culori memberikan nilai s dan l dalam rentang 0-1, kita konversi ke 0-100
  return { 
    h: color.h || 0, 
    s: color.s * 100, 
    l: color.l * 100 
  };
}

/**
 * Fungsi Keanggotaan Segitiga (trimf).
 * @param {number} x - Nilai input.
 * @param {Array<number>} params - Array [a, b, c] untuk titik segitiga.
 * @returns {number} - Derajat keanggotaan (0 hingga 1).
 */
function trimf(x, [a, b, c]) {
  return Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));
}

/**
 * Fungsi Keanggotaan Trapesium (trapmf).
 * @param {number} x - Nilai input.
 * @param {Array<number>} params - Array [a, b, c, d] untuk titik trapesium.
 * @returns {number} - Derajat keanggotaan (0 hingga 1).
 */
function trapmf(x, [a, b, c, d]) {
  return Math.max(0, Math.min((x - a) / (b - a), 1, (d - x) / (d - c)));
}

/**
 * Melakukan defuzzifikasi menggunakan metode Centroid (Center of Gravity).
 * @param {Object} rules - Objek yang berisi kekuatan setiap aturan (misal: {gagal: 0.8, aa: 0.2}).
 * @param {Object} consequent - Objek fungsi keanggotaan untuk variabel output.
 * @param {Array<number>} universe - Rentang universal untuk variabel output (misal: [0, 100]).
 * @returns {number} - Nilai crisp hasil defuzzifikasi.
 */
function defuzzify(rules, consequent, universe) {
  const step = 1;
  let weightedSum = 0;
  let weightSum = 0;

  for (let x = universe[0]; x <= universe[1]; x += step) {
    let aggregatedMembership = 0;
    // Agregasi (mengambil nilai max dari semua aturan yang 'terpotong')
    for(const [consequentName, ruleStrength] of Object.entries(rules)) {
      if (ruleStrength > 0) {
        const membershipValue = consequent[consequentName](x);
        aggregatedMembership = Math.max(aggregatedMembership, Math.min(ruleStrength, membershipValue));
      }
    }
    
    weightedSum += x * aggregatedMembership;
    weightSum += aggregatedMembership;
  }

  return weightSum === 0 ? 0 : weightedSum / weightSum;
}

// ===================================================================
//                 BAGIAN 2: DEFINISI SISTEM FUZZY
// ===================================================================

const antecedents = {
  lebar_perangkat: {
    mobile: (x) => trapmf(x, [0, 0, 480, 767]),
    tablet: (x) => trimf(x, [481, 768, 1023]),
    desktop: (x) => trapmf(x, [769, 1024, 1920, 1920]),
  },
  ukuran_teks: {
    kecil: (x) => trimf(x, [10, 14, 18]),
    normal: (x) => trimf(x, [16, 22, 28]),
    besar: (x) => trimf(x, [26, 38, 48]),
  },
  delta_luminositas: {
    buruk: (x) => trimf(x, [0, 15, 30]),
    menengah: (x) => trimf(x, [25, 40, 55]),
    bagus: (x) => trimf(x, [50, 65, 80]),
    ekstrem: (x) => trimf(x, [75, 100, 100]),
  },
  saturasi_keduanya: {
    normal_pucat: (x) => trimf(x, [0, 25, 50]),
    mencolok: (x) => trimf(x, [40, 70, 100]),
  }
};

const consequents = {
  skor_wcag: {
    gagal: (x) => trimf(x, [0, 20, 40]),
    aa: (x) => trimf(x, [35, 55, 75]),
    aaa: (x) => trimf(x, [70, 85, 100]),
    universe: [0, 100]
  },
  visibilitas_teks: {
    buruk: (x) => trimf(x, [0, 15, 33]),
    normal: (x) => trimf(x, [25, 45, 65]),
    bagus: (x) => trimf(x, [60, 100, 100]),
    universe: [0, 100]
  }
};

// ===================================================================
//                 BAGIAN 3: FUNGSI EVALUASI UTAMA
// ===================================================================

export function evaluateFuzzyLogic(body) {
  // --- 1. PROSES INPUT ---
  const hslBg = hexToHsl(body.bgColor);
  const hslFg = hexToHsl(body.textColor);
  
  const input = {
    delta_l: Math.abs(hslBg.l - hslFg.l),
    saturasi_gabungan: (hslBg.s + hslFg.s) / 2,
    ukuran_teks: (body.headingSize + body.subheadingSize) / 2,
    lebar_perangkat: body.deviceWidth
  };

  // --- 2. FUZZIFIKASI ---
  const deltaLMembership = {
    buruk: antecedents.delta_luminositas.buruk(input.delta_l),
    menengah: antecedents.delta_luminositas.menengah(input.delta_l),
    bagus: antecedents.delta_luminositas.bagus(input.delta_l),
    ekstrem: antecedents.delta_luminositas.ekstrem(input.delta_l),
  };
  const saturasiMembership = {
    normal_pucat: antecedents.saturasi_keduanya.normal_pucat(input.saturasi_gabungan),
    mencolok: antecedents.saturasi_keduanya.mencolok(input.saturasi_gabungan),
  };
  const ukuranTeksMembership = {
    kecil: antecedents.ukuran_teks.kecil(input.ukuran_teks),
    normal: antecedents.ukuran_teks.normal(input.ukuran_teks),
    besar: antecedents.ukuran_teks.besar(input.ukuran_teks),
  };
  const lebarPerangkatMembership = {
      mobile: antecedents.lebar_perangkat.mobile(input.lebar_perangkat),
      tablet: antecedents.lebar_perangkat.tablet(input.lebar_perangkat),
      desktop: antecedents.lebar_perangkat.desktop(input.lebar_perangkat),
  };

  // --- 3. EVALUASI ATURAN (INFERENCE) ---
  const kondisi_teks_besar = ukuranTeksMembership.besar;
  const kondisi_teks_normal_kecil = Math.max(ukuranTeksMembership.normal, ukuranTeksMembership.kecil);
  
  // Aturan Skor WCAG
  const ruleK1 = deltaLMembership.ekstrem;
  const ruleK2 = Math.min(deltaLMembership.bagus, kondisi_teks_besar);
  const ruleK3 = Math.min(deltaLMembership.bagus, kondisi_teks_normal_kecil, saturasiMembership.normal_pucat);
  const ruleK4 = Math.min(deltaLMembership.menengah, kondisi_teks_besar);
  const ruleK5 = Math.min(deltaLMembership.menengah, kondisi_teks_normal_kecil);
  const ruleK6 = Math.min(deltaLMembership.bagus, saturasiMembership.mencolok);
  const ruleK7 = deltaLMembership.buruk;
  
  // Aturan Visibilitas Teks
  const kondisi_ukuran_besar_normal_teks = Math.max(ukuranTeksMembership.besar, ukuranTeksMembership.normal);

  const ruleT1 = Math.min(lebarPerangkatMembership.desktop, kondisi_ukuran_besar_normal_teks);
  const ruleT2 = lebarPerangkatMembership.tablet;
  const ruleT3 = Math.min(lebarPerangkatMembership.mobile, kondisi_ukuran_besar_normal_teks);
  const ruleT4 = Math.min(lebarPerangkatMembership.desktop, ukuranTeksMembership.kecil);
  const ruleT5 = Math.min(lebarPerangkatMembership.mobile, ukuranTeksMembership.kecil);
  
  // --- 4. AGREGASI & DEFUZZIFIKASI ---
  const wcagRules = { aaa: Math.max(ruleK1, ruleK2), aa: Math.max(ruleK3, ruleK4), gagal: Math.max(ruleK5, ruleK6, ruleK7) };
  const textRules = { bagus: Math.max(ruleT1, ruleT2), normal: ruleT3 + ruleT4, buruk: ruleT5 };
  
  const hasil_wcag_score = defuzzify(wcagRules, consequents.skor_wcag, consequents.skor_wcag.universe);
  const hasil_teks_score = defuzzify(textRules, consequents.visibilitas_teks, consequents.visibilitas_teks.universe);
  
  // --- 5. KONVERSI SKOR KE LABEL ---
  let wcag_result = 'fail';
  if (hasil_wcag_score > 70) wcag_result = 'aaa';
  else if (hasil_wcag_score > 45) wcag_result = 'aa';

  let text_result = 'buruk';
  if (hasil_teks_score > 65) text_result = 'bagus';
  else if (hasil_teks_score > 35) text_result = 'normal';
  
  // --- 6. KEMBALIKAN HASIL ---
  return {
    wcag: wcag_result,
    text: text_result,
  };
}