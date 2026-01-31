import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Library, Flame, Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/98 backdrop-blur-md border-t border-border/50 safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/home" && location.pathname.startsWith("/mog"));
          
          // Center Create button with special styling
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-95 transition-all"
                aria-label="Create new content"
              >
                <item.icon className="h-5 w-5" />
              </button>
            );
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 transition-colors min-h-[44px] min-w-[44px]",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-[22px] w-[22px]", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
