
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
  onConnectionPointClick?: (blockId: string, point: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => void;
  model?: string;
  onModelChange?: (model: string) => void;
  toolbar?: React.ReactNode;
  generationTime?: number;
  connectedPoints?: Array<'top' | 'right' | 'bottom' | 'left'>;
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
  onConnectionPointClick,
  model,
  onModelChange,
  toolbar,
  generationTime,
  connectedPoints = []
}) => {
  const blockRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Register block with parent
  React.useEffect(() => {
    if (onRegisterRef && blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const points = {
        top: { x: rect.left + rect.width / 2, y: rect.top },
        right: { x: rect.right, y: rect.top + rect.height / 2 },
        bottom: { x: rect.left + rect.width / 2, y: rect.bottom },
        left: { x: rect.left, y: rect.top + rect.height / 2 }
      };
      onRegisterRef(id, blockRef.current, points);
    }
  }, [id, onRegisterRef]);

  const connectionPoints: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
  
  const getConnectionPointStyle = (point: 'top' | 'right' | 'bottom' | 'left') => {
    const isConnected = connectedPoints.includes(point);
    const baseStyle = "absolute rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm";
    const positionStyles = {
      top: "left-1/2 -translate-x-1/2 -top-3",
      right: "right-0 translate-x-1/2 top-1/2 -translate-y-1/2",
      bottom: "left-1/2 -translate-x-1/2 -bottom-3",
      left: "left-0 -translate-x-1/2 top-1/2 -translate-y-1/2"
    };
    
    if (isConnected) {
      return `${baseStyle} ${positionStyles[point]} w-3.5 h-3.5 bg-emerald-500/90 border-2 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)] animate-pulse`;
    }
    
    return `${baseStyle} ${positionStyles[point]} w-3 h-3 bg-zinc-800/80 border-2 border-zinc-600/50 opacity-0 group-hover:opacity-100 hover:w-3.5 hover:h-3.5 hover:bg-blue-500/90 hover:border-blue-400 hover:scale-110 hover:shadow-[0_0_16px_rgba(59,130,246,0.9)] cursor-crosshair`;
  };

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative w-80 bg-zinc-900/90 backdrop-blur-sm rounded-[20px] border transition-all duration-300",
        isSelected 
          ? 'border-blue-500/60 shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_32px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]' 
          : 'border-zinc-800/30 hover:border-zinc-700/50',
        "shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.02)]"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Toolbar */}
      {toolbar && (isHovered || isSelected) && (
        <div className="absolute -top-14 left-0 right-0 z-20">
          {toolbar}
        </div>
      )}
      {/* Connection Points */}
      {connectionPoints.map((point) => (
        <div
          key={point}
          className={getConnectionPointStyle(point)}
          onClick={(e) => {
            e.stopPropagation();
            onConnectionPointClick?.(id, point, e);
          }}
          title={`Connect ${point}`}
        >
          {connectedPoints.includes(point) ? (
            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-2 h-2 text-zinc-400 group-hover:text-blue-300 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>
      ))}

      {/* Header with Drag Handle */}
      <div className="px-4 py-3.5 border-b border-zinc-800/40 flex items-center gap-3 group/header bg-gradient-to-b from-zinc-900/50 to-transparent">
        {/* Prominent Drag Handle */}
        <div 
          className="drag-handle flex items-center justify-center w-8 h-8 -ml-1 rounded-md hover:bg-zinc-800/70 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105"
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4 text-zinc-600 group-hover/header:text-zinc-400 transition-colors" />
        </div>
        
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-xs font-medium text-zinc-400 truncate">{title}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {generationTime && (
              <span className="text-[10px] text-zinc-500">~{generationTime}s</span>
            )}
            {model && (
              <span className="text-[10px] font-medium text-zinc-300 px-2 py-0.5 bg-zinc-800/60 rounded-full border border-zinc-700/50">{model}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 rounded-b-[16px]">
        {children}
      </div>
    </motion.div>
  );
};

export default BlockBase;
