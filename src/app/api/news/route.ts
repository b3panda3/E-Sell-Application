import { NextRequest, NextResponse } from "next/server";

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  date: string;
  image: string | null;
  url: string;
}

// Simple in-memory cache
let cachedNews: NewsArticle[] = [];
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache
    if (cachedNews.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
      return NextResponse.json({ articles: cachedNews });
    }

    const articles: NewsArticle[] = [];

    // Fetch from NewsAPI
    const newsApiKey = process.env.NEWSAPI_KEY;
    if (newsApiKey) {
      try {
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${newsApiKey}`;
        const res = await fetch(newsApiUrl, { next: { revalidate: 600 } });
        if (res.ok) {
          const data = await res.json();
          if (data.articles) {
            for (const article of data.articles) {
              if (article.title && article.title !== "[Removed]") {
                articles.push({
                  title: article.title,
                  description: article.description || "",
                  source: article.source?.name || "NewsAPI",
                  date: article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "",
                  image: article.urlToImage || null,
                  url: article.url || "#",
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("NewsAPI fetch error:", e);
      }
    }

    // Fetch from Currents API
    const currentsApiKey = process.env.CURRENTS_API_KEY;
    if (currentsApiKey) {
      try {
        const currentsUrl = `https://api.currentsapi.services/v1/latest-news?language=en&category=business&apiKey=${currentsApiKey}`;
        const res = await fetch(currentsUrl, { next: { revalidate: 600 } });
        if (res.ok) {
          const data = await res.json();
          if (data.news) {
            for (const article of data.news) {
              if (article.title) {
                articles.push({
                  title: article.title,
                  description: article.description || "",
                  source: article.author || "Currents API",
                  date: article.published
                    ? new Date(article.published).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "",
                  image: article.image || null,
                  url: article.url || "#",
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("Currents API fetch error:", e);
      }
    }

    // If no articles from APIs, return fallback
    if (articles.length === 0) {
      const fallbackArticles: NewsArticle[] = [
        {
          title: "Bitcoin Surges Past Key Resistance Level",
          description: "Bitcoin has broken through a major resistance level, signaling potential for further gains.",
          source: "Crypto News",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
        {
          title: "Binance Smart Chain DeFi TVL Reaches New High",
          description: "Total value locked in BSC DeFi protocols reaches a new all-time high.",
          source: "DeFi Pulse",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
        {
          title: "Nigerian Fintech Sector Sees Record Investment",
          description: "Nigeria's fintech industry attracted record investment in the latest quarter.",
          source: "TechCrunch Africa",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
        {
          title: "E-Commerce Growth Accelerates in Africa",
          description: "Online commerce continues to expand rapidly across the African continent.",
          source: "Business Insider",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
        {
          title: "Stablecoins Gain Traction for Cross-Border Payments",
          description: "Stablecoins are increasingly being used for international money transfers.",
          source: "CoinDesk",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
        {
          title: "AI-Powered Commerce Tools Transform Retail",
          description: "Artificial intelligence is reshaping how merchants manage their online stores.",
          source: "Wired",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: null,
          url: "#",
        },
      ];
      cachedNews = fallbackArticles;
      cacheTime = Date.now();
      return NextResponse.json({ articles: fallbackArticles });
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const uniqueArticles = articles.filter((a) => {
      const key = a.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    cachedNews = uniqueArticles;
    cacheTime = Date.now();

    return NextResponse.json({ articles: uniqueArticles });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
