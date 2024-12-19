import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { fetchLSTMPredictionData, fetchProphetPredictionData, DATE_RANGES, ALLOWED_DATE_RANGE } from "@/lib/api";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "./ui/use-toast";

const PriceChart = () => {
  const [selectedRange, setSelectedRange] = useState<keyof typeof DATE_RANGES>('1M');

  const getDateRange = () => {
    const endDate = ALLOWED_DATE_RANGE.end;
    const startDate = subDays(endDate, DATE_RANGES[selectedRange].days);
    
    if (startDate < ALLOWED_DATE_RANGE.start) {
      toast({
        title: "Invalid Date Range",
        description: "Data is only available from 2021-01-01 to 2022-12-31",
        variant: "destructive",
      });
      return {
        startDate: format(ALLOWED_DATE_RANGE.start, 'yyyy-MM-dd'),
        endDate: format(ALLOWED_DATE_RANGE.end, 'yyyy-MM-dd')
      };
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const { data: lstmData, isLoading: lstmLoading, error: lstmError } = useQuery({
    queryKey: ['lstm-predictions', selectedRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRange();
      return fetchLSTMPredictionData(startDate, endDate);
    }
  });

  const { data: prophetData, isLoading: prophetLoading, error: prophetError } = useQuery({
    queryKey: ['prophet-predictions', selectedRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRange();
      return fetchProphetPredictionData(startDate, endDate);
    }
  });

  if (lstmLoading || prophetLoading) {
    return (
      <div className="space-y-4">
        <Card className="w-full h-[400px]">
          <CardHeader>
            <CardTitle>LSTM Model Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <Card className="w-full h-[400px]">
          <CardHeader>
            <CardTitle>Prophet Model Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lstmError || prophetError) {
    toast({
      title: "Error",
      description: "Failed to fetch prediction data",
      variant: "destructive",
    });
  }

  const renderChart = (data: any[], title: string, gradientPrefix: string) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <Button
              key={key}
              variant={selectedRange === key ? "default" : "outline"}
              onClick={() => setSelectedRange(key as keyof typeof DATE_RANGES)}
              className="text-sm"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`${gradientPrefix}ActualGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`${gradientPrefix}PredictedGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
                className="text-xs"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
                        <p className="text-sm font-medium">
                          {format(new Date(data.date), 'MMM d, yyyy')}
                        </p>
                        {data.actual_price !== null && (
                          <p className="text-sm text-amber-500">
                            Actual: ${data.actual_price.toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm text-green-500">
                          Predicted: ${data.predicted_price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Range: ${data.predicted_price_low.toLocaleString()} - ${data.predicted_price_high.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="actual_price"
                stroke="#fbbf24"
                fillOpacity={1}
                fill={`url(#${gradientPrefix}ActualGradient)`}
                strokeWidth={2}
                name="Actual Price"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="predicted_price"
                stroke="#22c55e"
                fillOpacity={1}
                fill={`url(#${gradientPrefix}PredictedGradient)`}
                strokeWidth={2}
                name="Predicted Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderChart(lstmData, "LSTM Model Predictions", "lstm")}
      {renderChart(prophetData, "Prophet Model Predictions", "prophet")}
    </div>
  );
};

export default PriceChart;