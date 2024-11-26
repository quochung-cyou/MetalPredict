import { Card } from "@/components/ui/card";
import PriceAlert from "@/components/PriceAlert";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Trash2 } from "lucide-react";

const Alerts = () => {
  const activeAlerts = [
    { id: 1, price: 1950, condition: "above", active: true },
    { id: 2, price: 1850, condition: "below", active: false },
  ];

  return (
    <div className="p-8 space-y-6 animate-enter">
      <h1 className="text-4xl font-bold mb-8">Price Alerts</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Create Alert</h2>
          <PriceAlert />
        </Card>

        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">
                    When price goes {alert.condition} ${alert.price}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current status: {alert.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    {alert.active ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Alerts;