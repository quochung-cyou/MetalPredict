import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PriceAlert = () => {
  const { toast } = useToast();
  const [threshold, setThreshold] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);

  const handleSetAlert = () => {
    setIsActive(true);
    toast({
      title: "Price Alert Set",
      description: `You will be notified when gold price reaches $${threshold}`,
    });
  };

  return (
    <Card className="glass-card p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Price Alerts</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            placeholder="Set price threshold"
            className="w-32"
          />
          <Button 
            onClick={handleSetAlert}
            variant={isActive ? "secondary" : "default"}
          >
            {isActive ? <BellRing className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
            {isActive ? "Alert Active" : "Set Alert"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PriceAlert;