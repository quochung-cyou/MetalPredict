import PriceChart from "@/components/PriceChart";
import CorrelationChart from "@/components/CorrelationChart";
import { Card } from "@/components/ui/card";

const Charts = () => {
  return (
    <div className="p-8 space-y-6 animate-enter">
      <h1 className="text-4xl font-bold mb-8">Advanced Charts</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Gold Price Chart</h2>
          <PriceChart />
        </Card>
        <CorrelationChart />
      </div>
    </div>
  );
};

export default Charts;