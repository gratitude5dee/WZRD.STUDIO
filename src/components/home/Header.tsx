
import { Plus, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreditsDisplay from '@/components/CreditsDisplay';
import { useAuth } from '@/providers/AuthProvider';
import { Logo } from '@/components/ui/logo';
import { GlassButton } from '@/components/ui/glass-button';

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateProject = () => {
    navigate('/project-setup');
  };

  return (
    <header className="relative border-b border-cosmic-stellar/20 bg-black backdrop-blur-xl">
      <div className="absolute inset-0 bg-nebula-field opacity-10 pointer-events-none" />
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Logo />

            {/* Cosmic Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cosmic-stellar/60" />
              <input
                type="text"
                placeholder="Search dimensions..."
                className="w-64 glass-input rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cosmic-stellar/30"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="h-3 w-3 text-cosmic-stellar/40 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits display */}
            {user && <CreditsDisplay showButton />}
            
            <GlassButton
              onClick={handleCreateProject}
              variant="stellar"
              glow="medium"
              particle
            >
              <Plus className="h-4 w-4" />
              New Reality
            </GlassButton>
          </div>
        </div>
      </div>
    </header>
  );
};
