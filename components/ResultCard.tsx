
import React from 'react';
import { PDFResult } from '../types';
import { Eye, Download, Bookmark, BookmarkCheck, Share2, ShieldCheck, FileText } from 'lucide-react';

interface ResultCardProps {
  result: PDFResult;
  isBookmarked: boolean;
  onToggleBookmark: (result: PDFResult) => void;
  onShare: (result: PDFResult) => void;
  onOpen: (result: PDFResult) => void;
  darkMode: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isBookmarked, onToggleBookmark, onShare, onOpen, darkMode }) => {
  return (
    <div className={`group rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${
      darkMode 
        ? 'bg-zinc-900 border-emerald-900/30 hover:border-emerald-500' 
        : 'bg-white border-slate-200 hover:border-yellow-400'
    }`}>
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
             <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
               darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-yellow-100 text-yellow-700'
             }`}>
               {result.source}
             </span>
             {["arXiv", "DOAJ", "OpenLibrary"].includes(result.source) && (
               <ShieldCheck className={`w-3.5 h-3.5 ${darkMode ? 'text-emerald-500' : 'text-blue-500'}`} />
             )}
          </div>
          <h3 className={`text-base font-bold leading-tight line-clamp-2 transition-colors ${
            darkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-yellow-600'
          }`}>
            {result.title}
          </h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(result); }}
          className={`p-2 rounded-xl transition-all ${
            isBookmarked 
              ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-yellow-400 text-white') 
              : (darkMode ? 'text-zinc-700 hover:text-emerald-400' : 'text-slate-300 hover:text-yellow-500')
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <p className={`text-xs line-clamp-2 mb-4 h-8 leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
        {result.snippet || "Download this study resource to access complete insights, diagrams, and full text for your research."}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpen(result)}
          className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black py-3 px-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest ${
            darkMode 
              ? 'bg-emerald-600 text-black hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 shadow-md'
          }`}
        >
          <Eye className="w-4 h-4" />
          Read
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onShare(result)}
            className={`p-3 rounded-xl border transition-colors ${
              darkMode ? 'border-zinc-800 text-zinc-600 hover:text-emerald-400' : 'border-slate-100 text-slate-400 hover:text-yellow-600'
            }`}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <a
            href={result.url}
            download
            className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
              darkMode ? 'border-zinc-800 text-zinc-600 hover:text-emerald-400' : 'border-slate-100 text-slate-400 hover:text-yellow-600'
            }`}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
