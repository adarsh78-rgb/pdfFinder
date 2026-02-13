
import { GoogleGenAI } from "@google/genai";
import { PDFResult } from "../types";

export const searchFallbackGemini = async (query: string): Promise<PDFResult[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Find specific, downloadable PDF files for the topic: "${query}". 
  Prioritize direct download links from educational (.edu), government (.gov), or known research repositories.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const results: PDFResult[] = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any, index: number) => {
        const uri = chunk.web.uri;
        const title = chunk.web.title || "Found PDF";
        
        let source = "Web Search";
        try {
          source = new URL(uri).hostname.replace('www.', '');
        } catch (e) {}

        return {
          id: `ai-${Date.now()}-${index}`,
          title: title,
          url: uri,
          source: source,
          snippet: response.text ? response.text.substring(0, 160).trim() + "..." : "PDF found via AI search grounding.",
          timestamp: Date.now()
        };
      });

    return results;
  } catch (error) {
    console.error("Gemini Fallback Error:", error);
    return [];
  }
};
