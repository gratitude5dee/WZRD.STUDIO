import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  status: 'idle' | 'queued' | 'running' | 'completed' | 'error';
  progress?: number;
  estimatedTime?: number;
  prompt?: string;
  blockType: 'text' | 'image' | 'video';
  className?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  status,
  progress = 0,
  estimatedTime = 0,
  prompt,
  blockType,
  className,
}) => {
  if (status === 'idle' || status === 'completed') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: Clock,
          color: 'text-amber-400',
          bgGradient: 'from-amber-500/5 to-orange-500/5',
          message: 'Queued for generation...',
        };
      case 'running':
        return {
          icon: Zap,
          color: 'text-blue-400',
          bgGradient: 'from-blue-500/5 to-purple-500/5',
          message: 'Generating...',
        };
      case 'error':
        return {
          icon: Sparkles,
          color: 'text-red-400',
          bgGradient: 'from-red-500/5 to-pink-500/5',
          message: 'Generation failed',
        };
      default:
        return {
          icon: Loader2,
          color: 'text-zinc-400',
          bgGradient: 'from-zinc-500/5 to-zinc-600/5',
          message: 'Processing...',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-xl border overflow-hidden',
        'bg-gradient-to-br',
        config.bgGradient,
        'border-zinc-800/30',
        className
      )}
    >
      {/* Animated background shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                'w-4 h-4',
                config.color,
                status === 'running' && 'animate-spin'
              )}
            />
            <span className="text-sm font-medium text-zinc-200">
              {config.message}
            </span>
          </div>
          {estimatedTime > 0 && status === 'running' && (
            <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm border-0">
              ~{estimatedTime}s
            </Badge>
          )}
        </div>

        {/* Prompt display */}
        {prompt && (
          <div className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {prompt}
          </div>
        )}

        {/* Progress bar */}
        {status === 'running' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-400 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-900/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  blockType === 'text' && 'bg-gradient-to-r from-blue-500 to-purple-500',
                  blockType === 'image' && 'bg-gradient-to-r from-purple-500 to-pink-500',
                  blockType === 'video' && 'bg-gradient-to-r from-amber-500 to-orange-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {status === 'running' && (
            <>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-blue-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                AI at work
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
