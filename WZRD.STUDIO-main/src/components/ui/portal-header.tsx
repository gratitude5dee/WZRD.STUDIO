import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';
import { GlassButton } from './glass-button';
import { Sparkles, Zap, Orbit, Atom } from 'lucide-react';

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  cosmic?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ 
  title, 
  subtitle, 
  cosmic = false,
  actions,
  className 
}) => {
  return (
    <GlassCard 
      variant={cosmic ? "cosmic" : "stellar"} 
      depth="deep" 
      glow="medium"
      interactive="none"
      particle={cosmic}
      shimmer
      className={cn("p-8", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {cosmic && (
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center">
                <Orbit className="w-8 h-8 text-cosmic-void animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cosmic-nebula flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className={cn(
              "text-3xl font-bold tracking-tight",
              cosmic ? "glow-text-cosmic" : "glow-text-primary"
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground font-light">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {actions}
          
          {cosmic && (
            <div className="flex space-x-2">
              <GlassButton variant="stellar" size="icon" glow="medium">
                <Zap className="w-4 h-4" />
              </GlassButton>
              <GlassButton variant="cosmic" size="icon" glow="medium">
                <Atom className="w-4 h-4" />
              </GlassButton>
            </div>
          )}
        </div>
      </div>
      
      {cosmic && (
        <div className="mt-6 flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cosmic-stellar animate-pulse" />
            <span>Portal Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cosmic-quantum animate-pulse" />
            <span>Neural Link Established</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cosmic-plasma animate-pulse" />
            <span>Cosmic Sync Active</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};