import { Image, Sparkles, Video, Workflow, Upload, Plus, Wand2, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  bgPattern?: string;
  isPro?: boolean;
  action: () => void;
}

const EmptyCanvasState = ({ onAddBlock, onExploreFlows, onDismiss }: EmptyCanvasStateProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

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
      action: handleDismiss,
    },
    {
      id: 'image',
      title: 'Image Generator',
      description: 'Text to image with Flux',
      icon: Image,
      gradient: 'from-purple-600 to-indigo-600',
      action: () => onAddBlock('image'),
    },
    {
      id: 'video',
      title: 'Video Generator',
      description: 'Video Generation with Wan 2.1',
      icon: Video,
      gradient: 'from-rose-600 to-orange-500',
      action: () => onAddBlock('video'),
    },
    {
      id: 'upscale',
      title: '8K Upscaling',
      description: 'Upscale images to 8K resolution',
      icon: Zap,
      gradient: 'from-teal-500 to-cyan-500',
      action: () => onAddBlock('image'),
    },
    {
      id: 'llm',
      title: 'LLM Captioning',
      description: 'Generate prompts from images',
      icon: Sparkles,
      gradient: 'from-amber-500 to-yellow-500',
      isPro: true,
      action: () => onAddBlock('text'),
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-500">
      <motion.div 
        className="text-center pointer-events-auto space-y-6 max-w-5xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header with Add Node Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900/80 border-zinc-700 hover:bg-zinc-800 text-white gap-2"
              onClick={() => onAddBlock('text')}
            >
              <Plus className="w-4 h-4" />
              Add a node
            </Button>
          </div>
          <p className="text-sm text-zinc-500">
            or drag and drop media files, or select a preset
          </p>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-5 gap-4">
          {presets.map((preset, index) => (
            <motion.button
              key={preset.id}
              onClick={preset.action}
              className={cn(
                'group relative flex flex-col overflow-hidden',
                'aspect-[3/4] rounded-2xl',
                'bg-zinc-900/90 border border-zinc-800/60',
                'hover:border-zinc-600 hover:bg-zinc-900',
                'transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 + 0.2 }}
              whileHover={{ y: -6 }}
            >
              {/* Preview Area - Top portion */}
              <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {/* Gradient Background */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300',
                  preset.gradient
                )} />
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Icon */}
                <div className={cn(
                  'relative w-14 h-14 rounded-2xl flex items-center justify-center',
                  'bg-gradient-to-br shadow-lg',
                  preset.gradient,
                  'group-hover:scale-110 transition-transform duration-300'
                )}>
                  <preset.icon className="w-7 h-7 text-white" />
                </div>

                {/* PRO Badge */}
                {preset.isPro && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/90 rounded-md text-[10px] font-bold text-black">
                    PRO
                  </div>
                )}
              </div>

              {/* Text Content - Bottom portion */}
              <div className="p-4 bg-zinc-900/60 border-t border-zinc-800/50">
                <h3 className="text-sm font-semibold text-white mb-1 text-left">
                  {preset.title}
                </h3>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors text-left line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                'bg-gradient-to-t from-transparent via-transparent to-white/5'
              )} />
            </motion.button>
          ))}
        </div>

        {/* Bottom Actions */}
        <motion.div 
          className="flex items-center justify-center gap-4 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Drag & Drop Hint */}
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-zinc-800/50 rounded-full">
            <Upload className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              Drag & drop media files to upload
            </span>
          </div>

          {/* Explore Flows Button */}
          {onExploreFlows && (
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white gap-2"
              onClick={onExploreFlows}
            >
              <Workflow className="w-4 h-4" />
              Explore Templates
            </Button>
          )}

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-300 gap-1.5"
            onClick={handleDismiss}
          >
            <X className="w-3.5 h-3.5" />
            Dismiss
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyCanvasState;