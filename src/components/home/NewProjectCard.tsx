
import { Plus, Sparkles, Atom } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface NewProjectCardProps {
  onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
  return (
    <GlassCard 
      variant="cosmic" 
      depth="deep" 
      glow="medium" 
      interactive="press"
      shimmer
      className="cursor-pointer group border-2 border-dashed border-[hsl(var(--stellar-gold))]/20 hover:border-[hsl(var(--stellar-gold))]/50 h-full min-h-[380px] transition-all duration-300 hover:shadow-[0_20px_60px_hsl(var(--glow-accent)/0.3)]"
      onClick={onClick}
    >
      <div className="h-full flex flex-col items-center justify-center p-8">
        {/* Large Plus Button */}
        <div className="relative mb-6">
          {/* Glow effect behind button */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--stellar-gold))] to-[hsl(var(--temporal-orange))] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-150" />
          
          {/* Main button */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--stellar-gold))]/30 to-[hsl(var(--temporal-orange))]/30 border-2 border-[hsl(var(--stellar-gold))]/50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-lg shadow-[hsl(var(--stellar-gold))]/20">
            <Plus className="h-12 w-12 text-[hsl(var(--stellar-gold))] group-hover:text-[hsl(var(--temporal-orange))] transition-colors duration-300" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Decorative Sparkles */}
        <div className="flex justify-center gap-3 mb-6">
          <Sparkles className="h-4 w-4 text-[hsl(var(--stellar-gold))]/60 animate-pulse" />
          <Atom className="h-4 w-4 text-[hsl(var(--glow-secondary))]/60 animate-spin" style={{ animationDuration: '4s' }} />
          <Sparkles className="h-4 w-4 text-[hsl(var(--temporal-orange))]/60 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="font-bold text-xl bg-gradient-to-r from-[hsl(var(--glow-primary))] via-[hsl(var(--glow-secondary))] to-[hsl(var(--glow-accent))] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            Create New Reality
          </h3>
          <p className="text-sm text-white/50 font-light">
            Begin your next cosmic journey
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
