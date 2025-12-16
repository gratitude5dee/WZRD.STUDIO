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
      "glass-sidebar border-r border-white/[0.04]"
    )}>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.04)] via-transparent to-[rgba(245,158,11,0.02)] pointer-events-none" />
      
      {/* Top highlight line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      {/* Workspace Switcher */}
      <div className="relative z-10 p-4 border-b border-white/[0.05]">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Menu Section */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">Main Menu</span>
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
                      ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] shadow-[0_0_20px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-[rgba(139,92,246,0.25)] shadow-[0_0_16px_rgba(139,92,246,0.4)]" 
                      : "bg-white/[0.04]"
                  )}>
                    <Icon className={cn("w-4 h-4", isActive && "text-[#A78BFA]")} />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.showBadge && (
                    <Badge variant="secondary" className="text-[9px] bg-[rgba(139,92,246,0.2)] text-[#A78BFA] border-[rgba(139,92,246,0.3)] px-1.5 py-0.5 font-semibold">
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
            <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">Collaborate</span>
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
                      ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isActive ? "bg-[rgba(139,92,246,0.25)]" : "bg-white/[0.04]"
                  )}>
                    <Icon className={cn("w-4 h-4", isActive && "text-[#A78BFA]")} />
                  </div>
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
            <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber" />
            </div>
            <span className="flex-1 text-left font-medium">Favorites</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                favoritesOpen ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
          
          {favoritesOpen && (
            <div className="mt-2 ml-6 pl-3 border-l border-white/[0.06] space-y-1">
              <p className="text-xs text-muted-foreground/50 py-2 italic">No favorites yet</p>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="relative z-10 p-4 border-t border-white/[0.05] space-y-4">
        {/* Credits Display */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(245,158,11,0.05)] border border-[rgba(139,92,246,0.2)] backdrop-blur-sm">
          <CreditsDisplay showTooltip={false} />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
              "border border-transparent hover:border-white/[0.08]"
            )}>
              <Settings className="w-4 h-4" />
            </button>
            <button className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
              "border border-transparent hover:border-white/[0.08]"
            )}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
              "text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20",
              "border border-transparent"
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
