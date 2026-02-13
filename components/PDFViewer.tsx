
import React from 'react';
import { X, ExternalLink, Download, RotateCw } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
  darkMode: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose, darkMode }) => {
  // Use Google Docs viewer as a proxy to bypass some IFrame restrictions
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        darkMode ? 'bg-black border-emerald-900 text-emerald-400' : 'bg-yellow-400 border-yellow-500 text-slate-900'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onClose} className="p-1 hover:opacity-70">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-black truncate uppercase tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:opacity-70" title="Open Original">
            <ExternalLink className="w-5 h-5" />
          </a>
          <a href={url} download className="p-2 hover:opacity-70" title="Download">
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>
      
      <div className="flex-1 bg-zinc-800 relative">
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 -z-10">
          <div className="text-center">
            <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Document...</p>
          </div>
        </div>
        <iframe
          src={viewerUrl}
          className="w-full h-full border-none"
          title="PDF Content"
        />
      </div>
    </div>
  );
};

export default PDFViewer;
