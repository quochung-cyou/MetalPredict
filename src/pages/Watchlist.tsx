import { Card } from "@/components/ui/card";
import { Star, StarOff, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Watchlist = () => {
  const watchlistItems = [
    { id: 1, name: "Gold Futures", price: "1,890.50", change: "+2.3%", isPositive: true },
    { id: 2, name: "Gold ETF (GLD)", price: "175.25", change: "-0.5%", isPositive: false },
    { id: 3, name: "Gold Mining Index", price: "245.75", change: "+1.2%", isPositive: true },
  ];

  return (
    <div className="p-8 space-y-6 animate-enter">
      <h1 className="text-4xl font-bold mb-8">Watchlist</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {watchlistItems.map((item) => (
          <Card key={item.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold">${item.price}</span>
                  <span className={`flex items-center gap-1 ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {item.isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {item.change}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Star className="w-5 h-5 text-yellow-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;