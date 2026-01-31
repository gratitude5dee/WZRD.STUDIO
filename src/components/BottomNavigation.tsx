import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Library, Flame, Play, Plus } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Flame, label: "Home", path: "/home" },
    { icon: Play, label: "Watch", path: "/watch" },
    { icon: Plus, label: "Create", path: "/mog/upload", isCenter: true },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", path: "/library" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/home" && location.pathname.startsWith("/mog"));
          
          // Center search button with special styling
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center h-12 w-12 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                <item.icon className="h-6 w-6" />
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}