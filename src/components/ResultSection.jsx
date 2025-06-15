// src/components/ResultSection.jsx

import { CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react'; // Import ikon Loader

const ResultSection = ({ results, isLoading }) => { // Terima prop isLoading

  const StatusRow = ({ label, status, isLoading }) => {
    let styles = {};
    let Icon = AlertTriangle;
    let statusText = "Normal";
    
    // Logika baru untuk menangani status loading
    if (isLoading && status === 'pending') {
        styles = { container: 'bg-slate-100', text: 'text-slate-500 animate-pulse' };
        Icon = Loader; // Gunakan ikon loader
        statusText = 'Mengecek...';
    } else {
        switch (status) {
            case 'pass':
            case 'bagus':
            case 'aaa':
            case 'aa':
                styles = { container: 'bg-green-100', text: 'text-green-800' };
                Icon = CheckCircle;
                statusText = status === 'bagus' ? 'Bagus' : 'Lulus';
                break;
            case 'normal':
                styles = { container: 'bg-yellow-100', text: 'text-yellow-800' };
                Icon = AlertTriangle;
                statusText = 'Normal';
                break;
            case 'fail':
            case 'buruk':
                styles = { container: 'bg-red-100', text: 'text-red-800' };
                Icon = XCircle;
                statusText = status === 'buruk' ? 'Buruk' : 'Gagal';
                break;
            default: // pending
                styles = { container: 'bg-slate-100', text: 'text-slate-500' };
                statusText = 'Belum Dihitung';
                Icon = () => <div className="w-5 h-5"></div>;
        }
    }


    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${styles.container}`}>
        <span className={`font-semibold ${styles.text}`}>{label}</span>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${styles.text} ${isLoading && status === 'pending' ? 'animate-spin' : ''}`} />
          <span className={`font-bold uppercase text-sm ${styles.text}`}>
            {statusText}
          </span>
        </div>
      </div>
    );
  };

  const wcagStatus = results ? results.wcag : 'pending';
  const textStatus = results ? results.text : 'pending';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold mb-4 border-b border-slate-200 pb-2">Hasil Penilaian</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-sky-600 mb-3">Visibilitas Warna (WCAG)</h3>
        <div className="space-y-2">
          <StatusRow 
            label="Teks Normal (AA)" 
            status={wcagStatus === 'aaa' || wcagStatus === 'aa' ? 'pass' : 'fail'} 
            isLoading={isLoading}
          />
          <StatusRow 
            label="Teks Normal (AAA)" 
            status={wcagStatus === 'aaa' ? 'pass' : 'fail'} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-sky-600 mb-3">Visibilitas Teks</h3>
        <div className="space-y-2">
           <StatusRow label="Keterbacaan Teks" status={textStatus} isLoading={isLoading}/>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;