// src/app/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react'; // Import useEffect dan useRef
import InputSection from '@/components/InputSection';
import PreviewSection from '@/components/PreviewSection';
import ResultSection from '@/components/ResultSection';

export default function Home() {
  // State untuk input form
  const [textColor, setTextColor] = useState('#111827');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [headingSize, setHeadingSize] = useState(36);
  const [subheadingSize, setSubheadingSize] = useState(16);
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // useRef untuk menyimpan ID dari setTimeout
  const debounceTimeout = useRef(null);

  // useEffect untuk memantau perubahan input
  useEffect(() => {
    // Hapus timeout sebelumnya jika ada perubahan baru
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setIsLoading(true); // Tampilkan loading segera setelah user mulai mengetik

    // Set timeout baru selama 2 detik (2000 ms)
    debounceTimeout.current = setTimeout(() => {
      handleCheckAccessibility();
    }, 2000);

    // Cleanup function untuk menghapus timeout jika komponen di-unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [textColor, bgColor, headingSize, subheadingSize]); // Dependency array


  const handleCheckAccessibility = async () => {
    // Fungsi ini sekarang dipanggil oleh useEffect
    const payload = {
      textColor, bgColor, headingSize, subheadingSize,
      deviceWidth: window.innerWidth
    };

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false); // Sembunyikan loading setelah selesai
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">Design <span className="text-sky-600">Accessibility</span> Checker</h1>
        <p className="text-slate-600 mt-2">
          Gunakan sistem fuzzy untuk menilai aksesibilitas desain Anda.
        </p>
      </header>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <InputSection
            textColor={textColor}
            setTextColor={setTextColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            headingSize={headingSize}
            setHeadingSize={setHeadingSize}
            subheadingSize={subheadingSize}
            setSubheadingSize={setSubheadingSize}
            // Prop onCheck dan isLoading tidak lagi dibutuhkan di sini
          />
          {/* Kirim isLoading ke ResultSection untuk feedback ke user */}
          <ResultSection results={results} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <PreviewSection
            textColor={textColor}
            bgColor={bgColor}
            headingSize={headingSize}
            subheadingSize={subheadingSize}
          />
        </div>
      </div>
    </main>
  );
}