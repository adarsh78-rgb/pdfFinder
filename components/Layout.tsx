
import React from 'react';
import { ViewMode } from '../types';
import { Search, Bookmark, History, Moon, Sun, FileText, LayoutGrid } from 'lucide-react';
import { ADMOB_CONFIG } from '../config/admob';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  setView: (view: ViewMode) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, darkMode, toggleDarkMode }) => {
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-black text-emerald-500' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 py-4 sm:px-6 transition-colors duration-500 ${darkMode ? 'bg-black/80 border-emerald-900/50' : 'bg-yellow-400 border-yellow-500'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewMode.SEARCH)}>
            <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-emerald-600' : 'bg-slate-900'}`}>
              <FileText className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-yellow-400'}`} />
            </div>
            <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-emerald-500' : 'text-slate-900'}`}>
              PDF <span className={darkMode ? 'text-white' : 'text-slate-700'}>FINDER</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all active:scale-90 ${darkMode ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-white/50 text-slate-800 hover:bg-white'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 mb-20">
        {children}
      </main>

      {/* Bottom Navigation (Android Style) */}
      <nav className={`fixed bottom-16 left-4 right-4 z-40 h-16 rounded-2xl border flex items-center justify-around shadow-2xl transition-all duration-500 ${darkMode ? 'bg-emerald-950 border-emerald-900 text-emerald-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <button
          onClick={() => setView(ViewMode.SEARCH)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.SEARCH ? (darkMode ? 'text-white' : 'text-yellow-600') : ''}`}
        >
          <Search className={`w-6 h-6 ${activeView === ViewMode.SEARCH ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button
          onClick={() => setView(ViewMode.BOOKMARKS)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.BOOKMARKS ? (darkMode ? 'text-white' : 'text-yellow-600') : ''}`}
        >
          <Bookmark className={`w-6 h-6 ${activeView === ViewMode.BOOKMARKS ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
        </button>
        <button
          onClick={() => setView(ViewMode.HISTORY)}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === ViewMode.HISTORY ? (darkMode ? 'text-white' : 'text-yellow-600') : ''}`}
        >
          <History className={`w-6 h-6 ${activeView === ViewMode.HISTORY ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Recent</span>
        </button>
      </nav>

      {/* Ad Banner Placeholder (Android Required) */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 h-14 border-t flex items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-black border-emerald-950 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
        <div className="text-[9px] font-bold tracking-[0.2em]">
          ADVERTISEMENT • GOOGLE ADMOB BANNER • {ADMOB_CONFIG.adUnitIds.banner}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
