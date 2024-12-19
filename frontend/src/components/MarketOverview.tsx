import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { fetchGoldPrices, fetchSilverPrices } from "@/lib/commoditiesApi";

interface PriceData {
  v: number;  // volume
  c: number;  // closing price
}

const MarketOverview = () => {
  const { data: goldData } = useQuery({
    queryKey: ['gold-prices'],
    queryFn: fetchGoldPrices
  });

  const { data: silverData } = useQuery({
    queryKey: ['silver-prices'],
    queryFn: fetchSilverPrices
  });

  const calculateVolume = (data: PriceData[] | undefined) => {
    const defaultResult = { value: "0", change: "0", isPositive: true };
    
    if (!data || !Array.isArray(data) || data.length < 2) {
      return defaultResult;
    }

    try {
      const currentVolume = data[data.length - 1]?.v ?? 0;
      const previousVolume = data[data.length - 2]?.v ?? 0;
      
      if (!currentVolume || !previousVolume) {
        return defaultResult;
      }

      const change = ((currentVolume - previousVolume) / previousVolume) * 100;
      
      return {
        value: (currentVolume * (data[data.length - 1]?.c ?? 0)).toLocaleString(),
        change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        isPositive: change >= 0
      };
    } catch (error) {
      console.error('Error calculating volume:', error);
      return defaultResult;
    }
  };

  const goldVolume = calculateVolume(goldData);
  const silverVolume = calculateVolume(silverData);


  const marketData = [
    {
      title: "Gold Trading Volume",
      value: `$${goldVolume.value}`,
      change: goldVolume.change,
      isPositive: goldVolume.isPositive,
      icon: BarChart2,
    },
    {
      title: "Silver Trading Volume",
      value: `$${silverVolume.value}`,
      change: silverVolume.change,
      isPositive: silverVolume.isPositive,
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