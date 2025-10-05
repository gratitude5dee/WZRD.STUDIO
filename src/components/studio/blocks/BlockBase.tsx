
import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ConnectionPoint {
  id: string;
  type: 'input' | 'output';
  label: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface BlockProps {
  id: string;
  type: 'text' | 'image' | 'video';
  title: string;
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
  position?: { x: number, y: number };
  onDragEnd?: (position: { x: number, y: number }) => void;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  onAddConnectedBlock?: (side: 'left' | 'right') => void;
  model?: string;
  onModelChange?: (model: string) => void;
}

const BlockBase: React.FC<BlockProps> = ({ 
  id, 
  type, 
  title, 
  children, 
  onSelect,
  isSelected,
  position = { x: 0, y: 0 },
  onDragEnd,
  onRegisterRef,
  onAddConnectedBlock,
  model,
  onModelChange
}) => {
  const blockRef = React.useRef<HTMLDivElement>(null);

  // Register block with parent
  React.useEffect(() => {
    if (onRegisterRef && blockRef.current) {
      onRegisterRef(id, blockRef.current, {});
    }
  }, [id, onRegisterRef]);

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative w-80 bg-zinc-900 rounded-xl border-2 transition-all duration-200",
        isSelected 
          ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' 
          : 'border-zinc-800 hover:border-zinc-700',
        "shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      )}
      onClick={onSelect}
    >
      {/* Left Connector */}
      {onAddConnectedBlock && (
        <button
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:border-blue-500 hover:scale-110 transition-all duration-200 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedBlock('left');
          }}
          title="Add connected block"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
        </button>
      )}

      {/* Right Connector */}
      {onAddConnectedBlock && (
        <button
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:border-blue-500 hover:scale-110 transition-all duration-200 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedBlock('right');
          }}
          title="Add connected block"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
        </button>
      )}

      {/* Header with Model Selector */}
      <div className="px-4 py-3 border-b border-zinc-800 cursor-move">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
          {model && onModelChange && (
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-xs text-zinc-300">
              {model}
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default BlockBase;
