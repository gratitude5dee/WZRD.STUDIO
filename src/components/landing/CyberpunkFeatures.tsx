import { motion } from 'framer-motion';
import { GlitchText } from '@/components/effects/GlitchText';
import { Workflow, Users, Shield, Download, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  accent: 'cyan' | 'magenta' | 'green' | 'purple' | 'yellow';
  size?: 'small' | 'medium' | 'large' | 'hero';
  className?: string;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon,
  accent,
  size = 'medium',
  className
}: FeatureCardProps) => {
  const accentColors = {
    cyan: 'cyan-400',
    magenta: 'magenta-400',
    green: 'green-400',
    purple: 'purple-400',
    yellow: 'yellow-400',
  };
  
  const sizeClasses = {
    small: 'p-6 min-h-[200px]',
    medium: 'p-8 min-h-[300px]',
    large: 'p-10 min-h-[400px]',
    hero: 'p-12 min-h-[500px]',
  };
  
  return (
    <motion.div 
      className={cn(
        "relative group cursor-pointer",
        "bg-gradient-to-br from-zinc-900/90 to-black/90",
        "border border-white/10",
        "rounded-2xl overflow-hidden",
        "transition-all duration-500",
        "hover:border-white/30",
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Animated Border Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-pulse",
          `via-${accentColors[accent]}/30`
        )} />
      </div>
      
      {/* Corner Brackets */}
      <div className={cn("absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2", `border-${accentColors[accent]}/50`)} />
      <div className={cn("absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2", `border-${accentColors[accent]}/50`)} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 mb-6 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br from-zinc-800 to-zinc-900",
          `border border-${accentColors[accent]}/30`
        )}>
          <div className={`text-${accentColors[accent]}`}>
            {icon}
          </div>
        </div>
        
        {/* Title */}
        <h3 className={cn(
          "font-display text-2xl md:text-3xl font-bold mb-4 transition-colors",
          `text-white group-hover:text-${accentColors[accent]}`
        )}>
          {title}
        </h3>
        
        {description && (
          <p className="font-body text-sm text-cyan-300/60 mb-6">
            {description}
          </p>
        )}
        
        {/* Glow Effect */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1/2 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500",
            `bg-${accentColors[accent]}`
          )}
        />
      </div>
    </motion.div>
  );
};

export const CyberpunkFeatures = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_50%)]" />
      </div>
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div 
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlitchText text="CAPABILITIES" className="text-5xl md:text-6xl font-display font-black mb-4" />
          <p className="text-xl text-cyan-400/60 font-body tracking-wider">
            {'>'} UNLEASH_THE_POWER_OF_AI
          </p>
        </motion.div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Large Hero Card */}
          <FeatureCard
            className="md:col-span-8 md:row-span-2"
            size="hero"
            title="CREATOR_DASHBOARD"
            description="Node-based AI workflows. Visual connections. Instant results."
            icon={<Workflow className="w-8 h-8" />}
            accent="cyan"
          />
          
          {/* Right Column */}
          <FeatureCard
            className="md:col-span-4"
            size="medium"
            title="REAL_TIME"
            description="Collaborate with your team in real-time"
            icon={<Users className="w-8 h-8" />}
            accent="magenta"
          />
          <FeatureCard
            className="md:col-span-4"
            size="medium"
            title="SECURE_VAULT"
            description="Enterprise-grade security"
            icon={<Shield className="w-8 h-8" />}
            accent="green"
          />
          
          {/* Bottom Row */}
          <FeatureCard
            className="md:col-span-6"
            size="medium"
            title="4K_EXPORT"
            description="Export in stunning quality"
            icon={<Download className="w-8 h-8" />}
            accent="purple"
          />
          <FeatureCard
            className="md:col-span-6"
            size="medium"
            title="AI_MODELS"
            description="Access cutting-edge AI"
            icon={<Sparkles className="w-8 h-8" />}
            accent="yellow"
          />
        </div>
      </div>
    </section>
  );
};
