import { Card } from "@/components/ui/card";
import TradingPairs from "@/components/TradingPairs";
import PriceStats from "@/components/PriceStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Trades = () => {
  return (
    <div className="p-8 space-y-6 animate-enter">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Trading Dashboard</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Trade
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceStats />
        </div>
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>
          <TradingPairs />
        </Card>
      </div>
    </div>
  );
};

export default Trades;