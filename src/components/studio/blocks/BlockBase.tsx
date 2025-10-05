
import React, { useState } from 'react';
import { Plus, ChevronDown, GripVertical } from 'lucide-react';
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
  toolbar?: React.ReactNode;
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
  onModelChange,
  toolbar
}) => {
  const blockRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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
        "group relative w-80 bg-zinc-900/90 backdrop-blur-sm rounded-2xl border transition-all duration-200",
        isSelected 
          ? 'border-blue-500/50 shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_32px_rgba(59,130,246,0.15)]' 
          : 'border-zinc-800/50 hover:border-zinc-700/50',
        "shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)]"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Toolbar */}
      {(isHovered || isSelected) && toolbar && (
        <div className="absolute -top-14 left-0 right-0">
          {toolbar}
        </div>
      )}
      {/* Left Connector */}
      {onAddConnectedBlock && (
        <button
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:border-blue-400 hover:scale-110 transition-all duration-200 z-10 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedBlock('left');
          }}
          title="Add connected block"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
        </button>
      )}

      {/* Right Connector */}
      {onAddConnectedBlock && (
        <button
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:border-blue-400 hover:scale-110 transition-all duration-200 z-10 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onAddConnectedBlock('right');
          }}
          title="Add connected block"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
        </button>
      )}

      {/* Header with Model Selector */}
      <div className="px-4 py-2.5 border-b border-zinc-800/50 cursor-move">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
          {model && onModelChange && (
            <button className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors text-[10px] text-zinc-400 border border-zinc-700/30">
              {model}
              <ChevronDown className="w-2.5 h-2.5" />
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
