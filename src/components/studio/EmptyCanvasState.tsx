import { Image, Sparkles, Video, Workflow, Upload, Plus, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyCanvasStateProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
  onExploreFlows?: () => void;
}

interface PresetCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  action: () => void;
}

const EmptyCanvasState = ({ onAddBlock, onExploreFlows }: EmptyCanvasStateProps) => {
  const presets: PresetCard[] = [
    {
      id: 'empty',
      title: 'Empty Workflow',
      description: 'Start from scratch',
      icon: Plus,
      gradient: 'from-zinc-700 to-zinc-800',
      action: () => {},
    },
    {
      id: 'image',
      title: 'Image Generator',
      description: 'Create AI images',
      icon: Image,
      gradient: 'from-purple-600/80 to-indigo-700/80',
      action: () => onAddBlock('image'),
    },
    {
      id: 'video',
      title: 'Video Generator',
      description: 'Animate from image',
      icon: Video,
      gradient: 'from-rose-600/80 to-orange-600/80',
      action: () => onAddBlock('video'),
    },
    {
      id: 'combine',
      title: 'Combine Ideas',
      description: 'Mix concepts with AI',
      icon: Sparkles,
      gradient: 'from-teal-600/80 to-cyan-600/80',
      action: () => onAddBlock('text'),
    },
    {
      id: 'flows',
      title: 'Explore Flows',
      description: 'Browse templates',
      icon: Workflow,
      gradient: 'from-amber-600/80 to-yellow-600/80',
      action: () => onExploreFlows?.(),
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-500">
      <motion.div 
        className="text-center pointer-events-auto space-y-8 max-w-4xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Wand2 className="w-4 h-4" />
            <span className="text-sm">Double-click anywhere to add a node</span>
          </div>
          <h2 className="text-lg text-zinc-300 font-medium">
            or select a preset to get started
          </h2>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-5 gap-4">
          {presets.map((preset, index) => (
            <motion.button
              key={preset.id}
              onClick={preset.action}
              className={cn(
                'group relative flex flex-col items-center justify-center',
                'aspect-[4/5] rounded-2xl overflow-hidden',
                'bg-zinc-900/80 border border-zinc-800/50',
                'hover:border-zinc-700 hover:bg-zinc-900',
                'transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient Background */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity',
                preset.gradient
              )} />

              {/* Icon */}
              <div className={cn(
                'relative w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                'bg-gradient-to-br',
                preset.gradient
              )}>
                <preset.icon className="w-6 h-6 text-white" />
              </div>

              {/* Text */}
              <div className="relative text-center px-2">
                <h3 className="text-sm font-medium text-white mb-0.5">
                  {preset.title}
                </h3>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {preset.description}
                </p>
              </div>

              {/* Hover Glow */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                'bg-gradient-to-t from-transparent via-transparent to-white/5'
              )} />
            </motion.button>
          ))}
        </div>

        {/* Drag & Drop Hint */}
        <motion.div 
          className="flex items-center justify-center gap-3 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-zinc-800/50 rounded-full">
            <Upload className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              Drag & drop media files to upload
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyCanvasState;