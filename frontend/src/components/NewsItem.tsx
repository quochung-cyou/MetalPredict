import { ExternalLink, TrendingUp, TrendingDown, Minus, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const NewsItem = ({ item }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getImpactBadge = (impact) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (impact) {
      case "high": return `${baseClasses} bg-red-500/20 text-red-500`;
      case "medium": return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      default: return `${baseClasses} bg-blue-500/20 text-blue-500`;
    }
  };

  return (
    <div className="block hover:bg-white/5 p-4 rounded-lg transition-colors border border-white/10">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          {item.isAnalyzed && (
            <div className="flex items-center gap-2">
              <span className={getImpactBadge(item.impact)}>
                {item.impact?.toUpperCase()} IMPACT
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
          )}
          <h3 className="font-medium text-lg">{item.title}</h3>
          {item.analysis && (
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.analysis}</p>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{item.source}</span>
            <span>•</span>
            <span>{item.time}</span>
            {item.isAnalyzed && item.priceEffect && (
              <>
                <span>•</span>
                <span className={cn(getSentimentColor(item.sentiment), "font-medium")}>
                  Price Impact: {item.priceEffect}
                </span>
              </>
            )}
          </div>
        </div>
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="shrink-0"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
        </a>
      </div>
    </div>
  );
};

export default NewsItem;