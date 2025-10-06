import React from 'react';
import { Type, Image, Video, Navigation, MousePointer, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConnectionNodeSelectorProps {
  position: { x: number; y: number };
  onSelectType: (type: 'text' | 'image' | 'video') => void;
  onNavigate: () => void;
  onCancel: () => void;
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
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute z-50 w-64"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-800/30">
          <div className="text-xs font-semibold text-zinc-400 tracking-wider">
            TURN INTO
          </div>
        </div>

        {/* Block Type Options */}
        <div className="p-2 space-y-1">
          {blockTypes.map((block) => (
            <button
              key={block.type}
              onClick={() => onSelectType(block.type)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md",
                "text-left text-sm text-zinc-300",
                "hover:bg-zinc-800 hover:text-white",
                "transition-all duration-200 group"
              )}
            >
              <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <block.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 font-medium">{block.label}</span>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 text-xs bg-zinc-800 rounded border border-zinc-700 group-hover:border-zinc-600">
                  {block.shortcut}
                </kbd>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800/50 my-2" />

        {/* Navigate & Select Options */}
        <div className="p-2 space-y-1">
          <button
            onClick={onNavigate}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md",
              "text-left text-sm text-zinc-300",
              "hover:bg-zinc-800 hover:text-white",
              "transition-all duration-200 group"
            )}
          >
            <Navigation className="w-4 h-4" />
            <span className="flex-1">Navigate</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={onCancel}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md",
              "text-left text-sm text-zinc-300",
              "hover:bg-zinc-800 hover:text-white",
              "transition-all duration-200 group"
            )}
          >
            <MousePointer className="w-4 h-4" />
            <span className="flex-1">Select</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/50 px-4 py-2.5 bg-zinc-800/20">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Open help documentation
            }}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learn about Blocks</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};
