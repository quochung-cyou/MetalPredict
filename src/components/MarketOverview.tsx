import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";

const MarketOverview = () => {
  const marketData = [
    {
      title: "Market Cap",
      value: "$12.5T",
      change: "+2.3%",
      isPositive: true,
      icon: BarChart2,
    },
    {
      title: "24h Volume",
      value: "$86.2B",
      change: "-1.2%",
      isPositive: false,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-enter">
      {marketData.map((item) => (
        <Card key={item.title} className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {item.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={item.isPositive ? "text-green-500" : "text-red-500"}>
                  {item.change}
                </span>
              </div>
            </div>
            <item.icon className="w-8 h-8 text-muted-foreground/50" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MarketOverview;