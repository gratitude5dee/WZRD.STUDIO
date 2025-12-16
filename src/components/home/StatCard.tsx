import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard = ({ 
  icon, 
  label, 
  value, 
  trend, 
  trendDirection = 'neutral',
  className 
}: StatCardProps) => {
  return (
    <div className={cn(
      "relative group p-5 rounded-2xl overflow-hidden transition-all duration-300",
      "glass-stat border border-white/[0.08]",
      "hover:border-primary/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.12)]",
      "hover:-translate-y-0.5",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Top shine line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      {/* Icon positioned top-right with glass effect */}
      <div className="absolute top-4 right-4 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.25)] transition-all duration-300">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Label */}
        <p className="text-[10px] text-muted-foreground/70 mb-1 font-semibold uppercase tracking-[0.15em]">
          {label}
        </p>
        
        {/* Value */}
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
        </div>
        
        {/* Trend badge */}
        {trend && (
          <div className="mt-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
              trendDirection === 'up' && "text-emerald-300 bg-emerald-500/15 border border-emerald-500/25",
              trendDirection === 'down' && "text-rose-300 bg-rose-500/15 border border-rose-500/25",
              trendDirection === 'neutral' && "text-amber-300 bg-amber/10 border border-amber/20"
            )}>
              {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
              {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
