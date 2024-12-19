import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Bot } from "lucide-react";
import { fetchGoldNews } from "@/lib/newsApi";
import { Skeleton } from "@/components/ui/skeleton";
import NewsItem from "./NewsItem";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchGoldNews();
        setNews(newsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []); // Only run once on component mount

  if (isLoading) {
    return (
      <Card className="glass-card p-6 animate-enter">
        <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="block p-4 rounded-lg border border-white/10">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card p-6 animate-enter">
        <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
        <p className="text-red-500">Failed to load news. Please try again later.</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 animate-enter">
      <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
      <div className="space-y-4">
        {news.length === 0 ? (
          <p className="text-muted-foreground">No relevant news available at the moment.</p>
        ) : (
          news.map((item) => (
            <NewsItem key={item.title} item={item} />
          ))
        )}
      </div>
    </Card>
  );
};

export default NewsFeed;