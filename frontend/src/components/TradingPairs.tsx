import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { fetchGoldPrices, fetchSilverPrices } from "@/lib/commoditiesApi";

const TradingPairs = () => {
  const { data: goldData } = useQuery({
    queryKey: ['gold-prices'],
    queryFn: fetchGoldPrices
  });

  const { data: silverData } = useQuery({
    queryKey: ['silver-prices'],
    queryFn: fetchSilverPrices
  });

  const getChangePercentage = (data: any[]) => {
    if (!data || data.length < 2) return { value: "0.00", isPositive: true };
    const current = data[data.length - 1].c;
    const previous = data[data.length - 2].c;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(2),
      isPositive: change >= 0
    };
  };

  const goldChange = goldData ? getChangePercentage(goldData) : { value: "0.00", isPositive: true };
  const silverChange = silverData ? getChangePercentage(silverData) : { value: "0.00", isPositive: true };

  const pairs = [
    {
      name: "Gold (XAU/USD)",
      price: goldData ? goldData[goldData.length - 1].c.toFixed(2) : "0.00",
      change: `${goldChange.isPositive ? '+' : '-'}${goldChange.value}%`,
      isPositive: goldChange.isPositive,
      chart: goldData?.slice(-7).map(d => d.c) || []
    },
    {
      name: "Silver (XAG/USD)",
      price: silverData ? silverData[silverData.length - 1].c.toFixed(2) : "0.00",
      change: `${silverChange.isPositive ? '+' : '-'}${silverChange.value}%`,
      isPositive: silverChange.isPositive,
      chart: silverData?.slice(-7).map(d => d.c) || []
    }
  ];

  return (
    <Card className="glass-card p-4 animate-enter">
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div 
            key={pair.name}
            className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <div>
              <h3 className="font-medium">{pair.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">${pair.price}</span>
                <div className={`flex items-center gap-1 text-sm ${pair.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {pair.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {pair.change}
                </div>
              </div>
            </div>
            
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pair.chart.map((value, index) => ({ value, index }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={pair.isPositive ? "#22c55e" : "#ef4444"}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TradingPairs;