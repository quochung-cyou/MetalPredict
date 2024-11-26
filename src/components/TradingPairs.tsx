import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const TradingPairs = () => {
  const pairs = [
    {
      name: "XAU/USD",
      price: "1,890.50",
      change: "+0.90%",
      isPositive: true,
      chart: [1850, 1855, 1870, 1865, 1880, 1875, 1890]
    },
    {
      name: "XAU/EUR",
      price: "1,750.25",
      change: "-0.45%",
      isPositive: false,
      chart: [1760, 1755, 1745, 1748, 1752, 1750, 1745]
    },
    {
      name: "XAU/GBP",
      price: "1,520.75",
      change: "+0.30%",
      isPositive: true,
      chart: [1510, 1515, 1518, 1520, 1519, 1521, 1520]
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