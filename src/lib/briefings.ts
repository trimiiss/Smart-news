export interface BriefingItem {
  title: string;
  summary: string;
  source: string;
  category: string;
  url?: string;
}

export interface StoredBriefing {
  id: string;
  date: string;
  content: BriefingItem[];
  created_at: string;
}

export interface SourceArticle {
  title: string;
  content: string;
  source: string;
  category: string;
  url: string;
}

export const VOICE_PROMPTS: Record<string, string> = {
  casual:
    "Write in a casual, friendly tone like you're texting a smart friend. Use contractions, simple language, and a light touch of humor when it fits.",
  professional:
    "Write in a clear, professional tone. Be direct, well-structured, and informative. Avoid slang.",
  witty:
    "Write with wit and personality. Use clever observations and a touch of humor while keeping the information accurate.",
  tldr:
    "Be ultra-concise. Use bullet points. Each summary should be 1-2 lines max. No fluff, just the key takeaway.",
};

export const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: "Keep each summary to 1-2 sentences.",
  medium: "Write 3-4 sentence summaries.",
  long: "Write a full paragraph summary with analysis.",
};

export function buildFallbackBriefing(
  articles: SourceArticle[],
  limit = 10
): BriefingItem[] {
  return articles.slice(0, limit).map((article) => ({
    title: article.title,
    summary: article.content.slice(0, 200),
    source: article.source,
    category: article.category,
    url: article.url,
  }));
}

export function parseBriefingResponse(text: string): BriefingItem[] | null {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.map((item) => ({
      title: String(item?.title || "Untitled"),
      summary: String(item?.summary || ""),
      source: String(item?.source || "Unknown"),
      category: String(item?.category || "General"),
      url: item?.url ? String(item.url) : undefined,
    }));
  } catch {
    return null;
  }
}
