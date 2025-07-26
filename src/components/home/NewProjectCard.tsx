
import { Plus, Sparkles, Atom } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface NewProjectCardProps {
  onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
  return (
    <GlassCard 
      variant="stellar" 
      depth="medium" 
      glow="medium" 
      interactive="press"
      particle
      shimmer
      className="cursor-pointer group border-dashed border-cosmic-stellar/30 hover:border-cosmic-stellar/60 h-full min-h-[280px]"
      onClick={onClick}
    >
      <div className="h-full flex flex-col">
        {/* Icon Area */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-quantum-flow opacity-10" />
          <div className="relative space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-stellar/30 to-cosmic-temporal/30 border border-cosmic-stellar/40 flex items-center justify-center group-hover:scale-110 transition-all duration-300 mx-auto">
              <Plus className="h-10 w-10 text-cosmic-stellar group-hover:text-cosmic-temporal transition-colors" />
            </div>
            
            <div className="flex justify-center space-x-2">
              <Sparkles className="h-4 w-4 text-cosmic-stellar/60 animate-pulse" />
              <Atom className="h-4 w-4 text-cosmic-quantum/60 animate-spin" style={{ animationDuration: '4s' }} />
              <Sparkles className="h-4 w-4 text-cosmic-temporal/60 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 text-center space-y-2">
          <h3 className="font-semibold text-lg glow-text-cosmic group-hover:glow-text-primary transition-all duration-300">
            Create New Reality
          </h3>
          <p className="text-sm text-muted-foreground">
            Begin your next cosmic journey
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
