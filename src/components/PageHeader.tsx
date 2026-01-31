import { useNavigate } from "react-router-dom";
import { BookOpen, Headphones, Video } from "lucide-react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { WalletButton } from "@/components/WalletButton";
import { cn } from "@/lib/utils";
import moltyLogo from "@/assets/molty.webp";

type TabType = 'read' | 'listen' | 'watch';

interface PageHeaderProps {
  activeTab: TabType;
  variant?: 'solid' | 'transparent';
  showCategories?: boolean;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const tabs: { id: TabType; label: string; icon: typeof BookOpen; path: string }[] = [
  { id: 'read', label: 'Read', icon: BookOpen, path: '/read' },
  { id: 'listen', label: 'Listen', icon: Headphones, path: '/listen' },
  { id: 'watch', label: 'Watch', icon: Video, path: '/watch' },
];

export function PageHeader({ 
  activeTab, 
  variant = 'solid',
  showCategories = false,
  categories = [],
  selectedCategory,
  onCategoryChange,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        variant === 'solid' 
          ? "bg-background/95 backdrop-blur-md border-b border-border/30" 
          : "bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-sm"
      )}
    >
      {/* Row 1: Brand Bar */}
      <div className="flex items-center justify-between px-4 h-14 safe-top">
        {/* Logo with Lobster */}
        <div className="flex items-center gap-2 min-w-[80px]">
          <img src={moltyLogo} alt="Mog" className="h-8 w-8 object-contain" />
          <span 
            className="text-lg font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E, #FF4500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mog
          </span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1.5">
          <NotificationsDropdown />
          <WalletButton compact />
        </div>
      </div>

      {/* Row 2: Tab Navigation */}
      <nav 
        className="relative px-2 border-b border-border/20 -mt-[50px]"
        role="tablist"
        aria-label="Content sections"
      >
        <div className="flex items-center justify-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 px-6 py-3 text-sm font-medium transition-colors touch-target",
                  "min-w-[80px] flex-1 max-w-[120px]",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Optional Categories Row */}
      {showCategories && categories.length > 0 && (
        <div className="px-4 py-2 overflow-x-auto scrollbar-hide bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange?.(cat)}
                className={cn(
                  "whitespace-nowrap text-sm font-medium transition-colors px-3 py-1 rounded-full",
                  selectedCategory === cat
                    ? "text-foreground bg-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
