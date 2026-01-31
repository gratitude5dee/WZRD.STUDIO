import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Library, Flame } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Flame, label: "Home", path: "/home" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Home, label: "Listen", path: "/listen" },
    { icon: Library, label: "Library", path: "/library" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/home" && location.pathname.startsWith("/mog"));
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