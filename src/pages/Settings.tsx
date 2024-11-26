import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Volume2 } from "lucide-react";

const Settings = () => {
  return (
    <div className="p-8 space-y-6 animate-enter">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="font-medium">Dark Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle dark mode on/off
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">Price Alerts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for price alerts
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="font-medium">Sound Effects</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Play sounds for important events
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <Button variant="destructive">Reset All Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;