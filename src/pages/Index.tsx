import Sidebar from "@/components/Sidebar";
import PriceChart from "@/components/PriceChart";
import PriceStats from "@/components/PriceStats";
import MarketOverview from "@/components/MarketOverview";
import NewsFeed from "@/components/NewsFeed";
import TradingPairs from "@/components/TradingPairs";
import CorrelationChart from "@/components/CorrelationChart";
import PriceAlert from "@/components/PriceAlert";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-16 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-8 animate-enter">
            <h1 className="text-4xl font-bold">Gold Price Tracker</h1>
            <PriceAlert />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <PriceChart />
            </div>
            <div className="space-y-6">
              <PriceStats />
              <TradingPairs />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CorrelationChart />
            <MarketOverview />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <NewsFeed />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;