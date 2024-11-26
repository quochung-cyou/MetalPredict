import { Card } from "@/components/ui/card";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

const NewsFeed = () => {
  const news = [
    {
      title: "Gold prices surge amid global economic uncertainty",
      source: "Financial Times",
      time: "2h ago",
      url: "#",
      impact: "high",
      sentiment: "positive",
      priceEffect: "+1.2%",
      analysis: "Rising geopolitical tensions and inflation concerns drive safe-haven demand"
    },
    {
      title: "Central banks increase gold reserves in Q1 2024",
      source: "Reuters",
      time: "4h ago",
      url: "#",
      impact: "medium",
      sentiment: "positive",
      priceEffect: "+0.8%",
      analysis: "Institutional buying pressure supports long-term price outlook"
    },
    {
      title: "Oil prices stabilize after recent volatility",
      source: "Bloomberg",
      time: "6h ago",
      url: "#",
      impact: "low",
      sentiment: "neutral",
      priceEffect: "0%",
      analysis: "Commodity correlation shows limited impact on gold prices"
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getImpactBadge = (impact: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (impact) {
      case "high": return `${baseClasses} bg-red-500/20 text-red-500`;
      case "medium": return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      default: return `${baseClasses} bg-blue-500/20 text-blue-500`;
    }
  };

  return (
    <Card className="glass-card p-6 animate-enter">
      <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
      <div className="space-y-4">
        {news.map((item) => (
          <div
            key={item.title}
            className="block hover:bg-white/5 p-4 rounded-lg transition-colors border border-white/10"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={getImpactBadge(item.impact)}>
                    {item.impact.toUpperCase()} IMPACT
                  </span>
                  <span className={getSentimentColor(item.sentiment)}>
                    {item.sentiment === "positive" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : item.sentiment === "negative" ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </span>
                </div>
                <h3 className="font-medium text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.analysis}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                  <span>•</span>
                  <span className={getSentimentColor(item.sentiment)}>
                    Price Impact: {item.priceEffect}
                  </span>
                </div>
              </div>
              <a href={item.url} className="shrink-0">
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NewsFeed;