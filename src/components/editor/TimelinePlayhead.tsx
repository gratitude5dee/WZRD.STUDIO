import React from 'react';
import { motion } from 'framer-motion';

interface TimelinePlayheadProps {
  currentTime: number;
  duration: number;
  pixelsPerSecond: number;
}

const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({ currentTime, duration, pixelsPerSecond }) => {
  const position = currentTime * pixelsPerSecond;

  return (
    <motion.div
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${position}px` }}
      animate={{ left: `${position}px` }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Playhead line with glow */}
      <div className="w-[2px] h-full bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.8)]" />
      
      {/* Playhead handle */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg pointer-events-auto cursor-grab active:cursor-grabbing" />
      
      {/* Time indicator */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-300 font-medium shadow-lg whitespace-nowrap">
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
