import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Video, Volume2, Image as ImageIcon, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioTrack, Clip } from '@/store/videoEditorStore';
import { useClipDrag } from '@/hooks/editor/useClipDrag';
import { useClipResize } from '@/hooks/editor/useClipResize';

interface TimelineClipProps {
  clip: Clip | AudioTrack;
  isSelected: boolean;
  onSelect: () => void;
  onConnectionPointClick: (clipId: string, point: 'left' | 'right', e: React.MouseEvent) => void;
  connectedPoints: Array<'left' | 'right'>;
  pixelsPerSecond: number;
  scrollOffset: number;
}

const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  isSelected,
  onSelect,
  onConnectionPointClick,
  connectedPoints,
  pixelsPerSecond,
  scrollOffset,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const clipRef = useRef<HTMLDivElement>(null);

  // Integrated drag and resize handlers
  const { dragState, startDrag, updateDrag, endDrag } = useClipDrag();
  const { resizeState, startResize, updateResize, endResize } = useClipResize();

  const connectionPoints = ['left', 'right'] as const;

  const getConnectionPointStyle = (point: 'left' | 'right', isConnected: boolean) => {
    const baseStyle = "absolute rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm";
    
    if (isConnected) {
      return `${baseStyle} w-3.5 h-3.5 bg-emerald-500/90 border-2 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)] animate-pulse`;
    }
    
    return `${baseStyle} w-3 h-3 bg-zinc-800/80 border-2 border-zinc-600/50 opacity-0 group-hover:opacity-100 hover:w-3.5 hover:h-3.5 hover:bg-blue-500/90 hover:border-blue-400 hover:scale-110 hover:shadow-[0_0_16px_rgba(59,130,246,0.9)] cursor-crosshair`;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00';
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getClipIcon = () => {
    switch (clip.type) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
    }
  };

  const getClipGradient = () => {
    switch (clip.type) {
      case 'video':
        return 'from-purple-900/90 to-purple-900/70';
      case 'audio':
        return 'from-blue-900/90 to-blue-900/70';
      case 'image':
        return 'from-purple-900/90 to-purple-900/70';
    }
  };

  return (
    <motion.div
      ref={clipRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group absolute rounded-[16px] backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden",
        isSelected 
          ? 'border-2 border-blue-500/60 shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_32px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]' 
          : 'border border-zinc-800/30 hover:border-zinc-700/50',
        "shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]",
        `bg-gradient-to-br ${getClipGradient()}`
      )}
      style={{
        left: `${((clip.startTime ?? 0) - scrollOffset) * pixelsPerSecond}px`,
        width: `${(clip.duration ?? 5) * pixelsPerSecond}px`,
        height: '48px',
        top: '8px'
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Points */}
      {connectionPoints.map(point => (
        <div
          key={point}
          className={getConnectionPointStyle(point, connectedPoints.includes(point))}
          style={{
            [point]: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onConnectionPointClick(clip.id, point, e);
          }}
        >
          {connectedPoints.includes(point) ? (
            <Check className="w-2 h-2 text-white" />
          ) : (
            <Plus className="w-2 h-2 text-zinc-400 group-hover:text-blue-300" />
          )}
        </div>
      ))}
      
      {/* Drag Handle */}
      <div className="drag-handle absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-zinc-800/70 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 opacity-0 group-hover:opacity-100">
        <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
      </div>
      
      {/* Clip Content */}
      <div className="flex items-center h-full px-3 gap-2 ml-8">
        {/* Icon/Thumbnail */}
        <div className="w-8 h-8 rounded bg-zinc-800/50 flex-shrink-0 flex items-center justify-center">
          {getClipIcon()}
        </div>
        
        {/* Clip Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-zinc-200 truncate">{clip.name}</div>
          <div className="text-[10px] text-zinc-500">{formatDuration(clip.duration)}</div>
        </div>
        
        {/* Duration Badge */}
        <div className="text-[10px] font-medium text-zinc-400 px-2 py-0.5 bg-zinc-800/60 rounded-full border border-zinc-700/50">
          {formatDuration(clip.duration)}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineClip;
