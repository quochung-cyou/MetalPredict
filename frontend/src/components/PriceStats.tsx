import { useQuery } from "@tanstack/react-query";
import { fetchLSTMPredictionData, fetchProphetPredictionData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "./ui/use-toast";
import { ALLOWED_DATE_RANGE } from "@/lib/api";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const PriceStats = () => {
  const startDate = format(ALLOWED_DATE_RANGE.start, 'yyyy-MM-dd');
  const endDate = format(ALLOWED_DATE_RANGE.end, 'yyyy-MM-dd');

  const { data: lstmData, isLoading: lstmLoading, error: lstmError } = useQuery({
    queryKey: ['lstm-latest', startDate, endDate],
    queryFn: () => fetchLSTMPredictionData(startDate, endDate),
  });

  const { data: prophetData, isLoading: prophetLoading, error: prophetError } = useQuery({
    queryKey: ['prophet-latest', startDate, endDate],
    queryFn: () => fetchProphetPredictionData(startDate, endDate),
  });

  if (lstmLoading || prophetLoading) {
    return (
      <div className="space-y-4">
        <Card className="w-full h-[100px]">
          <CardHeader>
            <CardTitle>LSTM Model Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[80px]" />
          </CardContent>
        </Card>
        <Card className="w-full h-[100px]">
          <CardHeader>
            <CardTitle>Prophet Model Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[80px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lstmError || prophetError) {
    toast({
      title: "Error",
      description: "Failed to fetch prediction stats",
      variant: "destructive",
    });
  }

  const latestLSTMData = lstmData[lstmData.length - 1];
  const latestProphetData = prophetData[prophetData.length - 1];

  const lstmPriceDiff = latestLSTMData.predicted_price - latestLSTMData.actual_price;
  const lstmPercentChange = (lstmPriceDiff / latestLSTMData.actual_price) * 100;

  const prophetPriceDiff = latestProphetData.predicted_price - latestProphetData.actual_price;
  const prophetPercentChange = (prophetPriceDiff / latestProphetData.actual_price) * 100;

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>LSTM Model Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Update Price {latestLSTMData.date}</p>
              <p className="text-2xl font-bold">${latestLSTMData.actual_price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Predicted Price {latestLSTMData.date}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">${latestLSTMData.predicted_price.toLocaleString()}</p>
                <span className={`flex items-center text-sm ${lstmPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {lstmPercentChange >= 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                  {Math.abs(lstmPercentChange).toFixed(2)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prediction Range</p>
              <p className="text-sm">
                ${latestLSTMData.predicted_price_low.toLocaleString()} - ${latestLSTMData.predicted_price_high.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Prophet Model Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Update Price {latestProphetData.date}</p>
              <p className="text-2xl font-bold">${latestProphetData.actual_price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Predicted Price {latestProphetData.date}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">${latestProphetData.predicted_price.toLocaleString()}</p>
                <span className={`flex items-center text-sm ${prophetPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {prophetPercentChange >= 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                  {Math.abs(prophetPercentChange).toFixed(2)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prediction Range</p>
              <p className="text-sm">
                ${latestProphetData.predicted_price_low.toLocaleString()} - ${latestProphetData.predicted_price_high.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceStats;