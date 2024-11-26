import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

const PriceStats = () => {
  return (
    <Card className="glass-card p-6 animate-enter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm text-muted-foreground">Current Price</h2>
          <p className="text-3xl font-bold mt-1">$1,890.50</p>
          <div className="flex items-center gap-2 mt-2">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+2.3%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">24h High</p>
            <p className="text-lg font-semibold mt-1">$1,895.20</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Low</p>
            <p className="text-lg font-semibold mt-1">$1,875.60</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-lg font-semibold mt-1">$2.5B</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold mt-1">$12.1T</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceStats;