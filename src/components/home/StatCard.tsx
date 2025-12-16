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
      "bg-gradient-to-br from-card/80 to-card/40",
      "backdrop-blur-xl border border-border/30",
      "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
      className
    )}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon positioned top-right */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Label */}
        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          {label}
        </p>
        
        {/* Value */}
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
        </div>
        
        {/* Trend */}
        {trend && (
          <div className="mt-3">
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
              trendDirection === 'up' && "text-emerald-400 bg-emerald-500/15 border border-emerald-500/20",
              trendDirection === 'down' && "text-rose-400 bg-rose-500/15 border border-rose-500/20",
              trendDirection === 'neutral' && "text-amber bg-amber/10 border border-amber/20"
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
