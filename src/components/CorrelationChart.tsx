import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { date: '2024-01', gold: 1890, oil: 75, correlation: 0.8 },
  { date: '2024-02', gold: 1920, oil: 78, correlation: 0.85 },
  { date: '2024-03', gold: 1950, oil: 82, correlation: 0.82 },
  { date: '2024-04', gold: 1980, oil: 85, correlation: 0.87 },
];

const CorrelationChart = () => {
  return (
    <Card className="glass-card p-6 w-full h-[400px] animate-enter">
      <h2 className="text-xl font-semibold mb-4">Gold-Oil Price Correlation</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="date" stroke="#666" />
          <YAxis yAxisId="left" stroke="#FFD700" />
          <YAxis yAxisId="right" orientation="right" stroke="#00FF00" />
          <Tooltip
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gold"
            name="Gold Price (USD)"
            stroke="#FFD700"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="oil"
            name="Oil Price (USD)"
            stroke="#00FF00"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default CorrelationChart;