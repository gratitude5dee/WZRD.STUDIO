import { X, FolderKanban, Layers, Users, Globe, Star, Settings, HelpCircle, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import CreditsDisplay from '../CreditsDisplay';
import { Badge } from '@/components/ui/badge';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const MobileSidebarDrawer = ({ isOpen, onClose, activeView, onViewChange }: MobileSidebarDrawerProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out');
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
    onClose();
  };

  const mainNavItems = [
    { id: 'all', label: 'All Projects', icon: FolderKanban },
    { id: 'kanvas', label: 'Kanvas', icon: Layers, isRoute: true, showBadge: true },
  ];

  const secondaryNavItems = [
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'community', label: 'Community', icon: Globe },
  ];

  const handleNavClick = (item: typeof mainNavItems[0]) => {
    if (item.isRoute) {
      navigate('/kanvas');
    } else {
      onViewChange(item.id);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 md:hidden",
        "bg-card border-r border-border/50",
        "transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Workspace Switcher */}
        <div className="p-4 border-b border-border/50">
          <WorkspaceSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Main Menu */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">Main Menu</span>
            </div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      isActive ? "bg-primary/25" : "bg-muted/50"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.showBadge && (
                      <Badge variant="secondary" className="text-[9px] bg-primary/20 text-primary border-primary/30">
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
                    onClick={() => { onViewChange(item.id); onClose(); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      isActive ? "bg-primary/25" : "bg-muted/50"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-card">
          {/* Credits */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <CreditsDisplay showTooltip={false} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
