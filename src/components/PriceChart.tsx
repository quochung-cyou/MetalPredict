import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Card } from "@/components/ui/card";
import { Search, Maximize2, Clock, BarChart2, ArrowUpDown } from 'lucide-react';
import { createWebSocketConnection } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface ChartData {
  time: string;
  currentPrice: number;
  price24h: number;
  predicted: number;
  ma7d: number; // 7-day moving average
}

const PriceChart = () => {
  const [liveData, setLiveData] = useState<ChartData[]>([]);
  
  const { data: initialData } = useQuery({
    queryKey: ['goldPrices'],
    queryFn: async () => {
      // Replace with actual API call
      return [
        { time: '00:00', currentPrice: 1850, price24h: 1840, predicted: 1855, ma7d: 1845 },
        { time: '04:00', currentPrice: 1855, price24h: 1845, predicted: 1860, ma7d: 1850 },
        { time: '08:00', currentPrice: 1870, price24h: 1860, predicted: 1875, ma7d: 1865 },
        { time: '12:00', currentPrice: 1865, price24h: 1855, predicted: 1870, ma7d: 1860 },
        { time: '16:00', currentPrice: 1880, price24h: 1870, predicted: 1885, ma7d: 1875 },
        { time: '20:00', currentPrice: 1875, price24h: 1865, predicted: 1880, ma7d: 1870 },
        { time: '24:00', currentPrice: 1890, price24h: 1880, predicted: 1895, ma7d: 1885 },
      ];
    },
  });

  useEffect(() => {
    if (initialData) {
      setLiveData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const ws = createWebSocketConnection((data) => {
      setLiveData(prev => {
        const newData = [...prev, data];
        if (newData.length > 100) newData.shift();
        return newData;
      });
    });

    return () => ws.close();
  }, []);

  return (
    <Card className="glass-card p-6 w-full h-[500px] animate-enter">
      <div className="flex flex-col h-full animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold animate-slide-in-right">Gold/USD</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg animate-scale-in">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search indicators..."
                className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors hover:scale-105 duration-200">
                <BarChart2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors hover:scale-105 duration-200">
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors hover:scale-105 duration-200">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 animate-fade-in">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((period, index) => (
            <button
              key={period}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {period}
            </button>
          ))}
        </div>
        
        <div className="flex-1 animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveData}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="color24h" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9C27B0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#666"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666"
                tickLine={false}
                axisLine={false}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  animation: 'scale-in 0.2s ease-out'
                }}
                wrapperStyle={{
                  transition: 'transform 0.2s ease-out'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="currentPrice"
                name="Current Price"
                stroke="#FFD700"
                strokeWidth={2}
                dot={false}
                fill="url(#colorCurrent)"
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="price24h"
                name="24h Price"
                stroke="#2196F3"
                strokeWidth={2}
                dot={false}
                fill="url(#color24h)"
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="predicted"
                name="Predicted"
                stroke="#4CAF50"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                fill="url(#colorPredicted)"
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="ma7d"
                name="7D MA"
                stroke="#9C27B0"
                strokeWidth={2}
                dot={false}
                fill="url(#colorMA)"
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default PriceChart;