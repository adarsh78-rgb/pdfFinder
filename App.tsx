
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ResultCard from './components/ResultCard';
import PDFViewer from './components/PDFViewer';
import { AppState, PDFResult, ViewMode, SearchHistory } from './types';
import { searchHybrid } from './services/pdfService';
import { searchFallbackGemini } from './services/geminiService';
import { Search, Loader2, Bookmark, BookmarkCheck, History as HistoryIcon, X, AlertCircle, FileText, LayoutGrid, Info } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    results: [],
    bookmarks: [],
    history: [],
    isLoading: false,
    error: null,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    activeView: ViewMode.SEARCH,
    currentViewerUrl: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activePdf, setActivePdf] = useState<PDFResult | null>(null);

  // Persistence
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('pdf-v3-bookmarks');
    const savedHistory = localStorage.getItem('pdf-v3-history');
    if (savedBookmarks) setState(prev => ({ ...prev, bookmarks: JSON.parse(savedBookmarks) }));
    if (savedHistory) setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
  }, []);

  useEffect(() => {
    localStorage.setItem('pdf-v3-bookmarks', JSON.stringify(state.bookmarks));
    localStorage.setItem('pdf-v3-history', JSON.stringify(state.history));
  }, [state.bookmarks, state.history]);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check Local Cache
    const cacheKey = `pdf-v3-cache-${cleanQuery}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setState(prev => ({ ...prev, results: parsed, activeView: ViewMode.SEARCH, error: null }));
      return; // Use cache if exists
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, results: [] }));
    
    // Update History
    setState(prev => ({
      ...prev,
      history: [{ query: query.trim(), timestamp: Date.now() }, ...prev.history.filter(h => h.query !== query.trim())].slice(0, 15)
    }));

    try {
      // Step A: Free Academic Sources
      let results = await searchHybrid(query);
      
      // Step B: AI Fallback (Gemini with Grounding)
      if (results.length < 3) {
        try {
          const aiResults = await searchFallbackGemini(query);
          results = [...results, ...aiResults];
        } catch (aiErr) {
          console.error("AI Search Failed", aiErr);
        }
      }

      // Unique results by URL
      const uniqueResults = Array.from(new Map(results.map(item => [item.url, item])).values());

      if (uniqueResults.length === 0) {
        setState(prev => ({ ...prev, isLoading: false, error: "No PDFs found for this topic. Try a broader term." }));
      } else {
        setState(prev => ({ ...prev, results: uniqueResults, isLoading: false }));
        localStorage.setItem(cacheKey, JSON.stringify(uniqueResults));
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: "Search failed. Check your network." }));
    }
  };

  const toggleBookmark = (pdf: PDFResult) => {
    setState(prev => {
      const isBookmarked = prev.bookmarks.some(b => b.url === pdf.url);
      if (isBookmarked) {
        return { ...prev, bookmarks: prev.bookmarks.filter(b => b.url !== pdf.url) };
      } else {
        return { ...prev, bookmarks: [pdf, ...prev.bookmarks] };
      }
    });
  };

  const handleShare = (pdf: PDFResult) => {
    if (navigator.share) {
      navigator.share({ title: pdf.title, url: pdf.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(pdf.url);
      alert('PDF link copied to clipboard.');
    }
  };

  const openViewer = (pdf: PDFResult) => {
    setActivePdf(pdf);
  };

  const renderView = () => {
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <div className="relative mb-6">
            <Loader2 className={`w-14 h-14 animate-spin ${state.darkMode ? 'text-emerald-500' : 'text-yellow-500'}`} />
            <div className={`absolute inset-0 blur-xl opacity-20 rounded-full ${state.darkMode ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
          </div>
          <p className="font-black text-[10px] tracking-[0.2em] uppercase opacity-60">Scanning Free Academic Repositories...</p>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="text-center py-20 px-6 max-w-sm mx-auto">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${state.darkMode ? 'bg-red-950/30 text-red-500' : 'bg-red-50 text-red-500'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase mb-2">Search Error</h3>
          <p className="text-xs font-bold opacity-60 uppercase tracking-tight mb-6">{state.error}</p>
          <button 
            onClick={() => handleSearch()}
            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest ${state.darkMode ? 'bg-emerald-600 text-black' : 'bg-yellow-400 text-slate-900'}`}
          >
            Retry Search
          </button>
        </div>
      );
    }

    switch (state.activeView) {
      case ViewMode.SEARCH:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {state.results.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${state.darkMode ? 'bg-zinc-900 text-emerald-900' : 'bg-yellow-50 text-yellow-300'}`}>
                  <FileText className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black mb-3 uppercase tracking-tighter">Instant PDF Search</h2>
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                  Search millions of free notes, textbooks, and journals with zero registration required.
                </p>
                
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                  {['Psychology', 'Web Dev', 'Linear Algebra', 'World History'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); handleSearch(tag); }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest transition-all active:scale-95 ${
                        state.darkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-500 hover:border-emerald-500' : 'bg-white border-slate-100 text-slate-500 hover:border-yellow-400 hover:text-yellow-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.results.map(pdf => (
                  <ResultCard 
                    key={pdf.id} 
                    result={pdf} 
                    darkMode={state.darkMode}
                    isBookmarked={state.bookmarks.some(b => b.url === pdf.url)}
                    onToggleBookmark={toggleBookmark}
                    onShare={handleShare}
                    onOpen={openViewer}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case ViewMode.BOOKMARKS:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className={`text-xl font-black uppercase tracking-tighter flex items-center gap-2 ${state.darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Bookmark className={`w-6 h-6 ${state.darkMode ? 'text-emerald-500' : 'text-yellow-500'}`} /> Saved Library
            </h2>
            {state.bookmarks.length === 0 ? (
              <div className={`p-16 text-center border-2 border-dashed rounded-[2rem] opacity-30 ${state.darkMode ? 'border-emerald-900' : 'border-slate-200'}`}>
                <p className="font-black uppercase text-[10px] tracking-widest">Your library is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.bookmarks.map(pdf => (
                  <ResultCard 
                    key={pdf.id} 
                    result={pdf} 
                    darkMode={state.darkMode}
                    isBookmarked={true}
                    onToggleBookmark={toggleBookmark}
                    onShare={handleShare}
                    onOpen={openViewer}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case ViewMode.HISTORY:
        return (
          <div className="space-y-4 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center justify-between mb-2">
               <h2 className="text-xl font-black uppercase tracking-tighter">Recent activity</h2>
               {state.history.length > 0 && (
                 <button onClick={() => setState(s => ({ ...s, history: [] }))} className="text-[10px] font-black uppercase opacity-50 hover:opacity-100 transition-opacity">Clear All</button>
               )}
             </div>
             {state.history.map((h, i) => (
               <div 
                key={i} 
                onClick={() => { setSearchQuery(h.query); handleSearch(h.query); }}
                className={`p-5 rounded-2xl flex items-center justify-between cursor-pointer border-2 transition-all active:scale-[0.98] ${
                  state.darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500 text-white' : 'bg-slate-50 border-white hover:bg-yellow-50 hover:border-yellow-200 text-slate-800'
                }`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg ${state.darkMode ? 'bg-zinc-800 text-emerald-500' : 'bg-white text-yellow-500 shadow-sm'}`}>
                     <Search className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-sm tracking-tight">{h.query}</span>
                 </div>
                 <HistoryIcon className="w-4 h-4 opacity-20" />
               </div>
             ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout 
      activeView={state.activeView} 
      setView={(v) => setState(s => ({ ...s, activeView: v }))}
      darkMode={state.darkMode}
      toggleDarkMode={() => setState(s => ({ ...s, darkMode: !s.darkMode }))}
    >
      {/* Search Bar Area */}
      <div className="max-w-xl mx-auto mb-8">
        <div className={`relative flex items-center rounded-[1.5rem] border-2 transition-all p-1.5 shadow-sm group ${
          state.darkMode 
            ? 'bg-zinc-950 border-zinc-800 focus-within:border-emerald-500' 
            : 'bg-white border-slate-100 focus-within:border-yellow-400 focus-within:shadow-xl'
        }`}>
          <Search className={`ml-4 w-5 h-5 ${state.darkMode ? 'text-emerald-900' : 'text-slate-300'} group-focus-within:${state.darkMode ? 'text-emerald-500' : 'text-yellow-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search topic, notes, books..."
            className="w-full bg-transparent py-3 px-4 outline-none font-bold text-sm placeholder:opacity-50"
          />
          <button
            onClick={() => handleSearch()}
            disabled={state.isLoading}
            className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 ${
              state.darkMode ? 'bg-emerald-600 text-black shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'bg-yellow-400 text-slate-900 shadow-md'
            }`}
          >
            {state.isLoading ? '...' : 'Go'}
          </button>
        </div>
      </div>

      {renderView()}

      {/* PDF Viewer Portal */}
      {activePdf && (
        <PDFViewer 
          url={activePdf.url} 
          title={activePdf.title} 
          onClose={() => setActivePdf(null)} 
          darkMode={state.darkMode}
        />
      )}
    </Layout>
  );
};

export default App;
