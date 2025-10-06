import React from 'react';
import { Type, Image, Video, Navigation, MousePointer, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConnectionNodeSelectorProps {
  position: { x: number; y: number };
  onSelectType: (type: 'text' | 'image' | 'video') => void;
  onNavigate: () => void;
  onCancel: () => void;
  isTransforming?: boolean;
  targetType?: 'text' | 'image' | 'video';
}

const blockTypes = [
  { type: 'text' as const, label: 'Text', icon: Type, shortcut: 'T' },
  { type: 'image' as const, label: 'Image', icon: Image, shortcut: 'I' },
  { type: 'video' as const, label: 'Video', icon: Video, shortcut: 'V' },
];

export const ConnectionNodeSelector: React.FC<ConnectionNodeSelectorProps> = ({
  position,
  onSelectType,
  onNavigate,
  onCancel,
  isTransforming = false,
  targetType,
}) => {
  const getBlockDimensions = (type: 'text' | 'image' | 'video') => {
    return { width: 320, height: 384 }; // Standard block size (w-80 h-96)
  };

  const selectedBlock = blockTypes.find(b => b.type === targetType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={
        isTransforming && targetType
          ? {
              opacity: 1,
              scale: 1,
              y: 0,
              width: getBlockDimensions(targetType).width,
              height: getBlockDimensions(targetType).height,
            }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: isTransforming ? 0.5 : 0.2
      }}
      className={cn(
        "absolute z-50",
        isTransforming ? "" : "w-64"
      )}
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn(
        "bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all",
        isTransforming && "shadow-[0_0_40px_rgba(59,130,246,0.6)]"
      )}>
        {/* Menu Content - Fades out during transformation */}
        <motion.div
          animate={{ opacity: isTransforming ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-800/40 to-transparent">
            <div className="text-xs font-bold text-zinc-400 tracking-wider">
              TURN INTO
            </div>
          </div>

          {/* Block Type Options */}
          <div className="p-2 space-y-1">
            {blockTypes.map((block) => (
              <motion.button
                key={block.type}
                onClick={() => onSelectType(block.type)}
                whileHover={{ x: 2 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "text-left text-sm text-zinc-300",
                  "hover:bg-zinc-800/80 hover:text-white",
                  "transition-all duration-200 group"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center group-hover:bg-zinc-700 group-hover:border-zinc-600 transition-all duration-200">
                  <block.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                </div>
                <span className="flex-1 font-medium">{block.label}</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800/60 text-zinc-400 rounded border border-zinc-700/50 group-hover:border-zinc-600 group-hover:text-zinc-300">
                    {block.shortcut}
                  </kbd>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800/50 my-1" />

          {/* Navigate & Select Options */}
          <div className="p-2 space-y-1">
            <motion.button
              onClick={onNavigate}
              whileHover={{ x: 2 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-left text-sm text-zinc-400",
                "hover:bg-zinc-800/60 hover:text-zinc-200",
                "transition-all duration-200 group"
              )}
            >
              <Navigation className="w-4 h-4" />
              <span className="flex-1">Navigate</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </motion.button>

            <motion.button
              onClick={onCancel}
              whileHover={{ x: 2 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-left text-sm text-zinc-400",
                "hover:bg-zinc-800/60 hover:text-zinc-200",
                "transition-all duration-200 group"
              )}
            >
              <MousePointer className="w-4 h-4" />
              <span className="flex-1">Select</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </motion.button>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800/50 px-4 py-3 bg-gradient-to-t from-zinc-800/30 to-transparent">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Open help documentation
              }}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group"
            >
              <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Learn about Blocks</span>
            </a>
          </div>
        </motion.div>

        {/* Block Preview - Fades in during transformation */}
        {isTransforming && selectedBlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="absolute inset-0 flex flex-col p-4"
          >
            {/* Block header preview */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <selectedBlock.icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200">{selectedBlock.label} Block</div>
                <div className="text-xs text-zinc-500">Creating...</div>
              </div>
            </div>

            {/* Loading indicator */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                <div className="text-xs text-zinc-400">Transforming menu...</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
