
import { PDFResult } from "../types";

/**
 * Fetches from arXiv (Open Access Research Papers)
 */
async function fetchArxiv(query: string): Promise<PDFResult[]> {
  try {
    const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    
    return Array.from(entries).map((entry, idx) => {
      const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() || "Research Paper";
      const links = Array.from(entry.getElementsByTagName("link"));
      const pdfLink = links.find(l => l.getAttribute("title") === "pdf")?.getAttribute("href") || 
                      links.find(l => l.getAttribute("type") === "application/pdf")?.getAttribute("href") || "";
      
      return {
        id: `arxiv-${Date.now()}-${idx}`,
        title,
        url: pdfLink,
        source: "arXiv",
        snippet: entry.getElementsByTagName("summary")[0]?.textContent?.substring(0, 150) + "...",
        timestamp: Date.now()
      };
    }).filter(p => p.url);
  } catch (e) {
    console.error("arXiv fetch error", e);
    return [];
  }
}

/**
 * Fetches from DOAJ (Directory of Open Access Journals)
 */
async function fetchDOAJ(query: string): Promise<PDFResult[]> {
  try {
    const response = await fetch(`https://doaj.org/api/v2/search/articles/${encodeURIComponent(query)}?pageSize=5`);
    const data = await response.json();
    
    return (data.results || []).map((res: any, idx: number) => {
      const fulltext = res.bibjson?.link?.find((l: any) => l.type === "fulltext")?.url || "";
      return {
        id: `doaj-${Date.now()}-${idx}`,
        title: res.bibjson?.title || "Academic Article",
        url: fulltext,
        source: "DOAJ",
        snippet: res.bibjson?.abstract?.substring(0, 150) + "...",
        timestamp: Date.now()
      };
    }).filter((p: any) => p.url && p.url.toLowerCase().includes("pdf"));
  } catch (e) {
    console.error("DOAJ fetch error", e);
    return [];
  }
}

/**
 * Fetches from OpenLibrary
 */
async function fetchOpenLibrary(query: string): Promise<PDFResult[]> {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    
    return (data.docs || []).map((doc: any, idx: number) => ({
      id: `ol-${Date.now()}-${idx}`,
      title: doc.title || "Book",
      url: `https://openlibrary.org${doc.key}`, // Most are views, not direct PDFs, but valid resource
      source: "OpenLibrary",
      snippet: `By ${doc.author_name?.join(", ") || "Unknown Author"}. First published in ${doc.first_publish_year || "N/A"}.`,
      timestamp: Date.now()
    })).filter((p: any) => p.url);
  } catch (e) {
    console.error("OpenLibrary fetch error", e);
    return [];
  }
}

export const searchHybrid = async (query: string): Promise<PDFResult[]> => {
  // Concurrent fetching from free sources
  const results = await Promise.all([
    fetchArxiv(query),
    fetchDOAJ(query),
    fetchOpenLibrary(query)
  ]);
  
  return results.flat();
};
