import React from 'react';
import { motion } from 'framer-motion';

interface TimelinePlayheadProps {
  currentTime: number;
  duration: number;
  pixelsPerSecond: number;
  scrollOffset?: number;
}

const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({ currentTime, duration, pixelsPerSecond, scrollOffset = 0 }) => {
  const position = Math.max(0, currentTime * pixelsPerSecond - scrollOffset);

  return (
    <motion.div
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${position}px` }}
      animate={{ left: `${position}px` }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Playhead line - green */}
      <div 
        className="w-[2px] h-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
        style={{ backgroundColor: '#10b981' }}
      />
      
      {/* Playhead handle - diamond shape */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-2 border-white shadow-lg pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: '#10b981' }}
      />
      
      {/* Time indicator */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-md border border-[#2a2a2a] rounded px-2 py-1 text-[10px] text-white font-medium shadow-lg whitespace-nowrap">
        {formatTime(currentTime)}
      </div>
    </motion.div>
  );
};

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export default TimelinePlayhead;
