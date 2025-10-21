import { Grid, Users, Globe, Star, Settings, HelpCircle, ChevronDown, LogOut, Layers } from 'lucide-react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import CreditsDisplay from '../CreditsDisplay';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const navItems = [
    { id: 'all', label: 'All', icon: Grid },
    { id: 'kanvas', label: 'Kanvas', icon: Layers, isRoute: true, showBadge: true },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'community', label: 'Community', icon: Globe },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0A0A0A] border-r border-white/[0.08] flex flex-col fixed left-0 top-0 z-50">
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-white/[0.08]">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.showBadge && (
                <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Coming Soon
                </Badge>
              )}
            </button>
          );
        })}

        {/* Favorites Section */}
        <div className="pt-6">
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white"
          >
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left">Favorites</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                favoritesOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
          
          {favoritesOpen && (
            <div className="mt-1 pl-9 space-y-1">
              <p className="text-xs text-white/40 py-2">No favorites yet</p>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/[0.08] space-y-3">
        <CreditsDisplay showTooltip={false} />
        
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
