import { Menu, Bell } from 'lucide-react';
import wzrdLogo from '@/assets/wzrd-logo.png';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className={cn(
      "h-14 border-b border-border/30 flex items-center justify-between px-4",
      "bg-card/80 backdrop-blur-xl sticky top-0 z-40 md:hidden"
    )}>
      <button
        onClick={onMenuClick}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex items-center gap-2">
        <img 
          src={wzrdLogo} 
          alt="WZRD.STUDIO" 
          className="h-7 object-contain"
        />
        <span className="text-[10px] text-primary bg-primary/15 px-1.5 py-0.5 rounded-full border border-primary/25 font-medium">
          ALPHA
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
};
