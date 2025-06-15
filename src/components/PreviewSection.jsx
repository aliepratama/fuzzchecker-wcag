// src/components/PreviewSection.jsx

import { useState, useEffect } from 'react';
import { Expand, Minimize } from 'lucide-react';

const PreviewSection = ({ textColor, bgColor, headingSize, subheadingSize }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  const previewContainerClasses = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col justify-center items-center p-8 transition-all duration-300 ease-in-out"
    : "w-full min-h-[700px] rounded-lg flex flex-col justify-center items-center p-8 transition-colors duration-200 border border-slate-200";

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-slate-200 pb-2 w-full">
          Pratinjau
        </h2>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="p-2 text-slate-500 hover:text-sky-600 transition-colors"
          title={isFullscreen ? "Keluar dari Fullscreen" : "Masuk ke Fullscreen"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Expand size={20} />}
        </button>
      </div>
      
      <div 
        className={previewContainerClasses}
        style={{ backgroundColor: bgColor }}
      >
        <h1 
          className="font-bold text-center" 
          style={{ 
            color: textColor, 
            fontSize: `${headingSize}px`, 
            transition: 'font-size 0.2s, color 0.2s'
          }}
        >
          Contoh Teks Heading
        </h1>
        <p 
          className="mt-4 text-center" 
          style={{ 
            color: textColor,
            fontSize: `${subheadingSize}px`,
            transition: 'font-size 0.2s, color 0.2s'
          }}
        >
          Ini adalah contoh teks subheading atau paragraf biasa untuk melihat keterbacaan pada desain Anda.
        </p>

        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/30 hover:bg-white/50 rounded-full text-slate-800"
            title="Tutup Fullscreen"
          >
            <Minimize size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PreviewSection;