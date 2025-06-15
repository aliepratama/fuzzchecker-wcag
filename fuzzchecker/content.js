document.addEventListener('DOMContentLoaded', function() {
    // Jalankan content script untuk mengambil data dari halaman
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        });
    });
});

// Terima pesan dari content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageData") {
        const data = request.data;

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

        // --- Proses 3: Analisis Lengkap (Opsional) ---
        // Jika ingin menggunakan fungsi utama analyzeFuzzyWCAG
        const inputs = {
            luminositas_bg: bgHsl.l,
            luminositas_fg: fgHsl.l,
            saturasi_bg: bgHsl.s,
            saturasi_fg: fgHsl.s,
            ukuran_heading: data.headingSize,
            ukuran_subheading: data.subheadingSize || data.headingSize * 0.8,
            lebar_perangkat: data.deviceWidth
        };

        const fullAnalysis = analyzeFuzzyWCAG(inputs);
        
        // Log hasil lengkap untuk debugging
        console.log('Full Fuzzy Analysis Results:', fullAnalysis);
        console.log('Input Data:', inputs);
        
        // Update additional info jika ada elemen untuk itu
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.innerHTML = `
                <h4>Debug Information:</h4>
                <p>Background HSL: H=${bgHsl.h.toFixed(1)}, S=${bgHsl.s.toFixed(1)}, L=${bgHsl.l.toFixed(1)}</p>
                <p>Foreground HSL: H=${fgHsl.h.toFixed(1)}, S=${fgHsl.s.toFixed(1)}, L=${fgHsl.l.toFixed(1)}</p>
                <p>Device Width: ${data.deviceWidth}px</p>
                <p>Heading Size: ${data.headingSize}px</p>
                <p>Subheading Size: ${data.subheadingSize || data.headingSize * 0.8}px</p>
                <p>Contrast Score: ${fullAnalysis.contrast.score} (${fullAnalysis.contrast.category})</p>
                <p>Visibility Score: ${fullAnalysis.visibility.score} (${fullAnalysis.visibility.category})</p>
            `;
        }
    }
});