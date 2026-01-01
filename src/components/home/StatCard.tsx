import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NumberTicker } from '@/components/ui/number-ticker';
import { ShineBorder } from '@/components/ui/shine-border';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
  index?: number;
}

export const StatCard = ({ 
  icon, 
  label, 
  value, 
  trend, 
  trendDirection = 'neutral',
  className,
  index = 0
}: StatCardProps) => {
  const isNumericValue = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative group p-5 rounded-2xl overflow-hidden transition-all duration-300",
        "glass-stat border border-white/[0.08]",
        "hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.15)]",
        "hover:-translate-y-0.5",
        className
      )}
    >
      {/* Shine Border on hover */}
      <ShineBorder
        shineColor={["#8B5CF6", "#06B6D4"]}
        borderWidth={1}
        duration={12}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Top shine line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      {/* Icon positioned top-right with purple glass effect */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(139,92,246,0.2)] to-[rgba(124,58,237,0.1)] border border-[rgba(139,92,246,0.25)] flex items-center justify-center group-hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all duration-300"
      >
        <div className="text-[#A78BFA]">
          {icon}
        </div>
      </motion.div>
      
      <div className="relative z-10">
        {/* Label */}
        <p className="text-[10px] text-muted-foreground/70 mb-1 font-semibold uppercase tracking-[0.15em]">
          {label}
        </p>
        
        {/* Value */}
        <div className="flex items-baseline gap-3 mt-2">
          {isNumericValue ? (
            <NumberTicker
              value={value}
              delay={0.3 + index * 0.1}
              className="text-3xl font-bold text-foreground tracking-tight"
            />
          ) : (
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </span>
          )}
        </div>
        
        {/* Trend badge */}
        {trend && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="mt-3"
          >
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
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
