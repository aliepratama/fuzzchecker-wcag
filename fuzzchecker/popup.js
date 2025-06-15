document.addEventListener('DOMContentLoaded', function() {
    // Jalankan content script untuk mengambil data dari halaman
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getPageData
        }, (results) => {
            if (results && results[0] && results[0].result) {
                processPageData(results[0].result);
            }
        });
    });
});

// Fungsi untuk memproses data halaman
function processPageData(data) {
    try {
        // --- Proses 1: Skor Aksesibilitas Kontras ---
        const bgHsl = rgbToHsl(data.backgroundColor);
        const fgHsl = rgbToHsl(data.headingColor);

        // Update UI dengan nilai input
        document.getElementById('luminositas_bg').textContent = bgHsl.l.toFixed(2);
        document.getElementById('saturasi_bg').textContent = bgHsl.s.toFixed(2);
        document.getElementById('luminositas_fg').textContent = fgHsl.l.toFixed(2);
        document.getElementById('saturasi_fg').textContent = fgHsl.s.toFixed(2);
        document.getElementById('ukuran_heading_kontras').textContent = data.headingSize.toFixed(2);
        
        // Lakukan inferensi fuzzy menggunakan fungsi dari fuzzy.js
        const contrastResult = calculateWCAGScore(
            bgHsl.l,           // luminositas_bg
            fgHsl.l,           // luminositas_fg
            bgHsl.s,           // saturasi_bg
            fgHsl.s,           // saturasi_fg
            data.headingSize,  // ukuran_heading
            data.subheadingSize || data.headingSize * 0.8  // ukuran_subheading (fallback)
        );
        
        // Tampilkan hasil
        const wcagElement = document.getElementById('skor_wcag');
        wcagElement.textContent = `${contrastResult.score} (${contrastResult.category})`;
        wcagElement.className = 'output ' + contrastResult.category.toLowerCase();
        
        // --- Proses 2: Skor Aksesibilitas Kontekstual ---
        // Update UI dengan nilai input
        document.getElementById('lebar_perangkat').textContent = data.deviceWidth;
        document.getElementById('ukuran_heading_konteks').textContent = data.headingSize.toFixed(2);
        document.getElementById('ukuran_subheading').textContent = (data.subheadingSize || data.headingSize * 0.8).toFixed(2);

        // Lakukan inferensi fuzzy menggunakan fungsi dari fuzzy.js
        const visibilityResult = calculateVisibilityScore(
            data.deviceWidth,
            data.headingSize,
            data.subheadingSize || data.headingSize * 0.8
        );

        // Tampilkan hasil
        const visibilityElement = document.getElementById('skor_visibilitas');
        visibilityElement.textContent = `${visibilityResult.score} (${visibilityResult.category.replace('_', ' ')})`;
        visibilityElement.className = 'output ' + visibilityResult.category;

        console.log('Contrast Result:', contrastResult);
        console.log('Visibility Result:', visibilityResult);
        console.log('Input Data:', data);
        
    } catch (error) {
        console.error('Error processing page data:', error);
        document.getElementById('skor_wcag').textContent = 'Error: ' + error.message;
        document.getElementById('skor_visibilitas').textContent = 'Error: ' + error.message;
    }
}

// Fungsi untuk inject ke halaman aktif
function getPageData() {
    // 1. Dapatkan warna background utama dari body
    const bodyStyle = window.getComputedStyle(document.body);
    let backgroundColor = bodyStyle.backgroundColor;
    
    // Jika background transparan, cari elemen parent
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        backgroundColor = 'rgb(255, 255, 255)'; // Default putih
    }

    // 2. Dapatkan heading yang paling menonjol (cari h1, jika tidak ada h2, dst.)
    let headingElement = document.querySelector('h1');
    if (!headingElement) headingElement = document.querySelector('h2');
    if (!headingElement) headingElement = document.querySelector('h3');
    if (!headingElement) headingElement = document.querySelector('p'); // Fallback ke paragraf
    if (!headingElement) headingElement = document.body; // Fallback terakhir

    const headingStyle = window.getComputedStyle(headingElement);
    let headingColor = headingStyle.color;
    const headingSize = parseFloat(headingStyle.fontSize) || 16; // Default 16px

    // Pastikan headingColor valid
    if (!headingColor || headingColor === 'rgba(0, 0, 0, 0)') {
        headingColor = 'rgb(0, 0, 0)'; // Default hitam
    }

    // 3. Dapatkan subheading (cari h2, jika tidak ada h3, dst.)
    let subheadingElement = document.querySelector('h2');
    if (!subheadingElement) subheadingElement = document.querySelector('h3');
    if (!subheadingElement) subheadingElement = document.querySelector('p'); // Fallback

    let subheadingSize = 14; // Default
    if (subheadingElement) {
        const subheadingStyle = window.getComputedStyle(subheadingElement);
        subheadingSize = parseFloat(subheadingStyle.fontSize) || 14;
    }

    // 4. Dapatkan lebar perangkat (viewport)
    const deviceWidth = window.innerWidth || 1920;

    return {
        backgroundColor,
        headingColor,
        headingSize,
        subheadingSize,
        deviceWidth
    };
}