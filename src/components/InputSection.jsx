// src/components/InputSection.jsx
import { useState } from 'react';
import { ChromePicker } from 'react-color';

const InputSection = ({ 
  textColor, setTextColor,
  bgColor, setBgColor,
  headingSize, setHeadingSize,
  subheadingSize, setSubheadingSize
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-2xl text-slate-800 font-semibold mb-4 border-b border-slate-200 pb-2">Pengaturan Desain</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-sky-600">Warna</h3>
        {/* Text Color Input */}
        <div className="flex justify-between items-center mb-3">
          <label className="text-slate-600">Warna Teks</label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-8 rounded border-2 border-slate-300 cursor-pointer" style={{ backgroundColor: textColor }} onClick={() => setShowTextColorPicker(!showTextColorPicker)} />
            <input type="text" value={textColor.toUpperCase()} onChange={(e) => setTextColor(e.target.value)} className="w-24 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-center"/>
          </div>
          { showTextColorPicker && (
            <div className="absolute z-10">
              <div className="fixed top-0 right-0 bottom-0 left-0" onClick={() => setShowTextColorPicker(false)}/>
              <ChromePicker 
                color={textColor} 
                onChange={(c) => setTextColor(c.hex)} 
                // Tambahkan prop ini untuk menangani event di mobile
                onChangeComplete={(c) => setTextColor(c.hex)}
                disableAlpha={true} 
              />
            </div>
          )}
        </div>
        {/* Background Color Input */}
        <div className="flex justify-between items-center">
          <label className="text-slate-600">Warna Latar</label>
           <div className="flex items-center gap-2">
            <div className="w-10 h-8 rounded border-2 border-slate-300 cursor-pointer" style={{ backgroundColor: bgColor }} onClick={() => setShowBgColorPicker(!showBgColorPicker)}/>
            <input type="text" value={bgColor.toUpperCase()} onChange={(e) => setBgColor(e.target.value)} className="w-24 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-center"/>
          </div>
           { showBgColorPicker && (
            <div className="absolute z-10">
              <div className="fixed top-0 right-0 bottom-0 left-0" onClick={() => setShowBgColorPicker(false)}/>
              <ChromePicker 
                color={bgColor} 
                onChange={(c) => setBgColor(c.hex)}
                // Tambahkan juga prop ini di sini
                onChangeComplete={(c) => setBgColor(c.hex)}
                disableAlpha={true} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-sky-600">Ukuran Teks (px)</h3>
         <div className="flex justify-between items-center mb-3">
          <label htmlFor="headingSize" className="text-slate-600">Heading</label>
          <input type="number" id="headingSize" value={headingSize} onChange={(e) => setHeadingSize(Number(e.target.value))} min="12" max="48" className="w-24 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-center"/>
        </div>
        <div className="flex justify-between items-center">
          <label htmlFor="subheadingSize" className="text-slate-600">Subheading</label>
          <input type="number" id="subheadingSize" value={subheadingSize} onChange={(e) => setSubheadingSize(Number(e.target.value))} min="10" max="36" className="w-24 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-center"/>
        </div>
      </div>
      
      {/* Tombol sudah tidak ada */}
    </div>
  );
};

export default InputSection;