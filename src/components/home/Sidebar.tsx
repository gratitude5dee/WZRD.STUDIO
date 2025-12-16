import { Grid, Users, Globe, Star, Settings, HelpCircle, ChevronDown, LogOut, Layers, Sparkles, Home, FolderKanban } from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import CreditsDisplay from '../CreditsDisplay';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out');
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const mainNavItems = [
    { id: 'all', label: 'All Projects', icon: FolderKanban },
    { id: 'kanvas', label: 'Kanvas', icon: Layers, isRoute: true, showBadge: true },
  ];

  const secondaryNavItems = [
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'community', label: 'Community', icon: Globe },
  ];

  return (
    <aside className={cn(
      "w-64 h-screen flex flex-col fixed left-0 top-0 z-50",
      "bg-gradient-to-b from-card/95 to-background/95",
      "backdrop-blur-xl border-r border-border/30"
    )}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Workspace Switcher */}
      <div className="relative z-10 p-4 border-b border-border/30">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Menu Section */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</span>
          </div>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isRoute) {
                      navigate('/kanvas');
                    } else {
                      onViewChange(item.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.showBadge && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary border-primary/30 px-1.5">
                      New
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-3">
            <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collaborate</span>
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorites Section */}
        <div>
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Star className="w-4 h-4 text-amber-500/70" />
            <span className="flex-1 text-left font-medium">Favorites</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                favoritesOpen ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
          
          {favoritesOpen && (
            <div className="mt-2 ml-6 pl-3 border-l border-border/30 space-y-1">
              <p className="text-xs text-muted-foreground/60 py-2 italic">No favorites yet</p>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="relative z-10 p-4 border-t border-border/30 space-y-4">
        {/* Credits Display */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-border/30">
          <CreditsDisplay showTooltip={false} />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}>
              <Settings className="w-4 h-4" />
            </button>
            <button className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              "text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
            )}
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
