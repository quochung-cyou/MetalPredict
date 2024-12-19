import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GNEWS_API_KEY = "";
const GEMINI_API_KEY = "";

// Cache durations
const ANALYSIS_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cache helper functions
const getFromCache = (key: string, duration: number) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      console.log(`Cache miss for key: ${key}`);
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > duration;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    console.log(`Cache hit for key: ${key}`);
    return data;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
};

const setToCache = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Cache write error:", error);
  }
};

// Interfaces remain the same
export interface NewsItem {
  title: string;
  description: string;
  content: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

export interface AnalyzedNews {
  title: string;
  source: string;
  time: string;
  url: string;
  impact?: "high" | "medium" | "low";
  sentiment?: "positive" | "negative" | "neutral";
  priceEffect?: string;
  analysis?: string;
  isAnalyzed: boolean;
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const analyzeNewsWithGemini = async (
  newsItems: NewsItem[]
): Promise<Record<string, any>> => {
  const cacheKey = `news-analysis-${JSON.stringify(
    newsItems.map((item) => item.title)
  )}`;
  const cached = getFromCache(cacheKey, ANALYSIS_CACHE_DURATION);
  if (cached) return cached;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const articlesText = newsItems
      .map(
        (item, index) =>
          `Article ${index + 1}:
      Title: ${item.title}
      Content: ${item.content}`
      )
      .join("\n\n");

    const prompt = `Analyze these gold-related news articles and provide a JSON response with this exact structure (no markdown, no backticks, just pure JSON):
    {
      "articles": [
        {
          "index": number,
          "impact": "high" | "medium" | "low" | null,
          "sentiment": "positive" | "negative" | "neutral" | null,
          "priceEffect": "string with percentage including + or - prefix. ex: +5%, or just May up/May down" | null,
          "analysis": "brief a meaningful, concise, conclusion summary analysis, along with action if needed" | null
        }
      ]
    }`;

    const result = await model.generateContent(
      prompt + `\n\nArticles to analyze:\n${articlesText}`
    );
    const text = result.response.text().trim();

    try {
      const cleanJson = text.replace(/^```json\s*|\s*```$/g, "").trim();
      const analysis = JSON.parse(cleanJson);
      setToCache(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.warn("Failed to parse Gemini response:", error);
      return { articles: [] };
    }
  } catch (error) {
    console.warn("Failed to analyze with Gemini:", error);
    return { articles: [] };
  }
};

export const fetchGoldNews = async (): Promise<AnalyzedNews[]> => {
  const cacheKey = "gold-news-data";
  const cachedNews = getFromCache(cacheKey, FETCH_CACHE_DURATION);
  if (cachedNews) {
    return cachedNews;
  }

  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/search?q=gold+price+market&lang=en&country=us&max=5&apikey=${GNEWS_API_KEY}`
    );

    const basicNews: AnalyzedNews[] = response.data.articles.map(
      (article: NewsItem) => ({
        title: article.title,
        source: article.source.name,
        time: new Date(article.publishedAt).toLocaleTimeString(),
        url: article.url,
        isAnalyzed: false,
      })
    );

    const analysis = await analyzeNewsWithGemini(response.data.articles);

    const analyzedNews = analysis.articles
      ? basicNews.map((news, index) => ({
          ...news,
          impact: analysis.articles[index]?.impact,
          sentiment: analysis.articles[index]?.sentiment,
          priceEffect: analysis.articles[index]?.priceEffect,
          analysis: analysis.articles[index]?.analysis,
          isAnalyzed: true,
        }))
      : basicNews;

    setToCache(cacheKey, analyzedNews);
    return analyzedNews;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    throw new Error("Failed to fetch news. Please try again later.");
  }
};
