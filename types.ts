
export interface PDFResult {
  id: string;
  title: string;
  url: string;
  source: string; // e.g., 'arXiv', 'DOAJ', 'OpenLibrary', 'Google/AI'
  snippet?: string;
  date?: string;
  timestamp: number;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
}

export enum ViewMode {
  SEARCH = 'SEARCH',
  BOOKMARKS = 'BOOKMARKS',
  HISTORY = 'HISTORY',
  VIEWER = 'VIEWER'
}

export interface AppState {
  results: PDFResult[];
  bookmarks: PDFResult[];
  history: SearchHistory[];
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
  activeView: ViewMode;
  currentViewerUrl: string | null;
}
