import React from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TimelinePlayheadProps {
  currentTime: number;
  duration: number;
  pixelsPerSecond: number;
  scrollOffset?: number;
}

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({ currentTime, duration, pixelsPerSecond, scrollOffset = 0 }) => {
  const position = Math.max(0, currentTime * pixelsPerSecond - scrollOffset);
  
  // Visual debugging - log positioning calculations
  if (process.env.NODE_ENV === 'development') {
    console.log('Playhead Debug:', {
      currentTime,
      pixelsPerSecond,
      scrollOffset,
      calculatedPosition: position,
      formattedTime: formatTime(currentTime)
    });
  }

  return (
    <TooltipProvider>
      <motion.div
        className="absolute top-0 bottom-0 z-50 pointer-events-none"
        style={{ left: `${position}px` }}
        animate={{ left: `${position}px` }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Time indicator tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className="bg-[#10b981] text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg">
                {formatTime(currentTime)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#10b981] text-white border-none">
            <p className="font-mono">{formatTime(currentTime)} / {formatTime(duration)}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Playhead line - green, thicker for visibility */}
        <div 
          className="w-[3px] h-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          style={{ backgroundColor: '#10b981' }}
        />
        
        {/* Playhead handle - diamond shape at top */}
        <div 
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 pointer-events-auto cursor-grab active:cursor-grabbing shadow-lg"
          style={{ backgroundColor: '#10b981' }}
        />
        
        {/* Visual debugging indicator (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full" title="Playhead Debug Marker" />
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default TimelinePlayhead;
