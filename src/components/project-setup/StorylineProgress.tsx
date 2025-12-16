import { motion } from 'framer-motion';
import { Loader2, Check, Sparkles, Film, Users, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StorylineProgressProps {
  status: 'idle' | 'creating' | 'generating' | 'scenes' | 'characters' | 'complete' | 'failed';
  scenesCount: number;
  charactersCount: number;
  errorMessage?: string;
}

const stages = [
  { key: 'creating', label: 'Creating storyline...', icon: FileText },
  { key: 'generating', label: 'Writing story...', icon: Sparkles },
  { key: 'scenes', label: 'Discovering scenes...', icon: Film },
  { key: 'characters', label: 'Identifying characters...', icon: Users },
  { key: 'complete', label: 'Complete!', icon: Check },
];

export function StorylineProgress({ status, scenesCount, charactersCount, errorMessage }: StorylineProgressProps) {
  if (status === 'idle') return null;

  const currentStageIndex = stages.findIndex(s => s.key === status);
  const progress = status === 'complete' ? 100 : status === 'failed' ? 0 : Math.min(90, (currentStageIndex + 1) * 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Sparkles className="w-5 h-5 text-primary" />
          {status !== 'complete' && status !== 'failed' && (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </div>
        <span className="text-sm font-medium text-foreground">
          {status === 'failed' ? 'Generation failed' : 'Generating storyline...'}
        </span>
        {status !== 'complete' && status !== 'failed' && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />
        )}
        {status === 'complete' && (
          <Check className="w-4 h-4 text-green-500 ml-auto" />
        )}
      </div>

      <Progress value={progress} className="h-2 mb-3" />

      {status === 'failed' && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {status !== 'failed' && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {stages.slice(0, currentStageIndex + 1).map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === currentStageIndex && status !== 'complete';
            const isDone = idx < currentStageIndex || status === 'complete';
            
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-1.5 ${isActive ? 'text-primary' : isDone ? 'text-green-500' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{stage.label}</span>
                {stage.key === 'scenes' && scenesCount > 0 && (
                  <span className="text-primary font-medium">({scenesCount})</span>
                )}
                {stage.key === 'characters' && charactersCount > 0 && (
                  <span className="text-primary font-medium">({charactersCount})</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
