import { Image, Sparkles, Video, Workflow, Upload, Plus, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { TextAnimate } from '@/components/ui/text-animate';
import { ShineBorder } from '@/components/ui/shine-border';

interface EmptyCanvasStateProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
  onExploreFlows?: () => void;
  onDismiss?: () => void;
}

interface PresetCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  shineColors: string[];
  isPro?: boolean;
  action: () => void;
}

const EmptyCanvasState = ({ onAddBlock, onExploreFlows, onDismiss }: EmptyCanvasStateProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const presets: PresetCard[] = [
    {
      id: 'empty',
      title: 'Empty Workflow',
      description: 'Start from scratch',
      icon: Plus,
      gradient: 'from-zinc-600 to-zinc-700',
      shineColors: ['hsl(var(--text-secondary))'],
      action: handleDismiss,
    },
    {
      id: 'image',
      title: 'Image Generator',
      description: 'Text to image with Flux',
      icon: Image,
      gradient: 'from-purple-600 to-indigo-600',
      shineColors: ['hsl(var(--accent-purple))', 'hsl(260, 80%, 60%)'],
      action: () => onAddBlock('image'),
    },
    {
      id: 'video',
      title: 'Video Generator',
      description: 'Video Generation with Wan 2.1',
      icon: Video,
      gradient: 'from-rose-600 to-orange-500',
      shineColors: ['hsl(var(--accent-rose))', 'hsl(20, 90%, 55%)'],
      action: () => onAddBlock('video'),
    },
    {
      id: 'upscale',
      title: '8K Upscaling',
      description: 'Upscale images to 8K resolution',
      icon: Zap,
      gradient: 'from-teal-500 to-cyan-500',
      shineColors: ['hsl(var(--accent-teal))', 'hsl(190, 90%, 50%)'],
      action: () => onAddBlock('image'),
    },
    {
      id: 'llm',
      title: 'LLM Captioning',
      description: 'Generate prompts from images',
      icon: Sparkles,
      gradient: 'from-amber-500 to-yellow-500',
      shineColors: ['hsl(var(--accent-amber))', 'hsl(45, 100%, 50%)'],
      isPro: true,
      action: () => onAddBlock('text'),
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-500">
      <motion.div 
        className="text-center pointer-events-auto space-y-8 max-w-5xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header with Add Node Button */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ShimmerButton
              shimmerColor="hsl(var(--accent-purple))"
              shimmerSize="0.08em"
              shimmerDuration="2.5s"
              borderRadius="12px"
              background="hsl(var(--surface-1))"
              className="gap-2 text-sm font-medium px-5 py-2.5"
              onClick={() => onAddBlock('text')}
            >
              <Plus className="w-4 h-4" />
              Add a node
            </ShimmerButton>
          </div>
          <TextAnimate 
            animation="blurInUp" 
            by="word" 
            className="text-sm text-text-tertiary"
            duration={0.6}
            delay={0.2}
          >
            or drag and drop media files, or select a preset
          </TextAnimate>
        </div>

        {/* Preset Cards Grid */}
        <motion.div 
          className="grid grid-cols-5 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.3 }
            }
          }}
        >
          {presets.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={preset.action}
              onMouseEnter={() => setHoveredCard(preset.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={cn(
                'group relative flex flex-col overflow-hidden',
                'aspect-[3/4] rounded-2xl',
                'bg-surface-1/90 border border-border-subtle',
                'hover:border-border-default',
                'transition-colors duration-300'
              )}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
            >
              {/* ShineBorder on hover */}
              {hoveredCard === preset.id && (
                <ShineBorder 
                  shineColor={preset.shineColors}
                  borderWidth={2}
                  duration={3}
                />
              )}

              {/* Preview Area - Top portion */}
              <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {/* Gradient Background */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity duration-500',
                  preset.gradient
                )} />
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to right, hsl(var(--text-primary) / 0.2) 1px, transparent 1px),
                                      linear-gradient(to bottom, hsl(var(--text-primary) / 0.2) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Icon */}
                <motion.div 
                  className={cn(
                    'relative w-14 h-14 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br shadow-lg shadow-black/30',
                    preset.gradient
                  )}
                  animate={hoveredCard === preset.id ? { scale: 1.12, rotate: 3 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <preset.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* PRO Badge */}
                {preset.isPro && (
                  <motion.div 
                    className="absolute top-3 right-3 px-2 py-0.5 bg-accent-amber rounded-md text-[10px] font-bold text-black"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 hsl(var(--accent-amber) / 0.4)',
                        '0 0 8px 2px hsl(var(--accent-amber) / 0.3)',
                        '0 0 0 0 hsl(var(--accent-amber) / 0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    PRO
                  </motion.div>
                )}
              </div>

              {/* Text Content - Bottom portion */}
              <div className="p-4 bg-surface-0/60 border-t border-border-subtle backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-text-primary mb-1 text-left">
                  {preset.title}
                </h3>
                <p className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors duration-300 text-left line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                'bg-gradient-to-t from-transparent via-transparent to-white/5'
              )} />
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom Actions */}
        <motion.div 
          className="flex items-center justify-center gap-4 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {/* Drag & Drop Hint */}
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 bg-surface-1/60 border border-border-subtle rounded-full backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Upload className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs text-text-secondary">
              Drag & drop media files to upload
            </span>
          </motion.div>

          {/* Explore Flows Button */}
          {onExploreFlows && (
            <motion.button
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
              onClick={onExploreFlows}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Workflow className="w-4 h-4" />
              Explore Templates
            </motion.button>
          )}

          {/* Dismiss Button */}
          <motion.button
            className="flex items-center gap-1.5 px-3 py-2 text-text-tertiary hover:text-text-secondary transition-colors text-sm"
            onClick={handleDismiss}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-3.5 h-3.5" />
            Dismiss
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyCanvasState;
