import { Home, LineChart, Settings, DollarSign, Bell, Newspaper, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: LineChart, label: "Charts", path: "/charts" },
    { icon: DollarSign, label: "Trades", path: "/trades" },
    { icon: Bell, label: "Alerts", path: "/alerts" },
    { icon: Star, label: "Watchlist", path: "/watchlist" },
    { icon: Newspaper, label: "News", path: "/news" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-background border-r border-border animate-slide-in">
      <div className="flex flex-col items-center py-4 space-y-8">
        <div className="p-2">
          <div className="w-8 h-8 bg-gold rounded-full" />
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 hover:bg-white/10",
              "group relative flex items-center",
              location.pathname === item.path && "bg-white/10"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="absolute left-14 px-2 py-1 bg-white/10 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;