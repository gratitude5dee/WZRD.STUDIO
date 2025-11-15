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
  const isVisible = position >= 0;
  
  // Visual debugging - log positioning calculations
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Playhead:', {
      time: formatTime(currentTime),
      position: `${position}px`,
      visible: isVisible,
      zoom: pixelsPerSecond,
      scroll: scrollOffset
    });
  }

  return (
    <TooltipProvider>
      <motion.div
        className="absolute top-0 bottom-0 z-50 pointer-events-none"
        style={{ left: `${position}px` }}
        animate={{ 
          left: `${position}px`,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Pulsing glow effect behind playhead */}
        <motion.div
          className="absolute inset-0 w-[8px] -ml-[2.5px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
            filter: 'blur(4px)'
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Time indicator - always visible */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-auto">
          <motion.div 
            className="bg-[#10b981] text-white px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap shadow-xl border border-[#059669]"
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="font-semibold">{formatTime(currentTime)}</span>
            </div>
          </motion.div>
          {/* Tooltip connector line */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#10b981]" />
        </div>
        
        {/* Main playhead line with enhanced visibility */}
        <div className="relative h-full">
          {/* Outer glow */}
          <div 
            className="absolute inset-0 w-[6px] -ml-[1.5px] h-full"
            style={{ 
              backgroundColor: '#10b981',
              opacity: 0.3,
              filter: 'blur(3px)'
            }}
          />
          {/* Solid line */}
          <div 
            className="relative w-[3px] h-full shadow-[0_0_20px_rgba(16,185,129,1),0_0_40px_rgba(16,185,129,0.5)]"
            style={{ backgroundColor: '#10b981' }}
          >
            {/* Top edge highlight */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
        
        {/* Playhead handle - larger diamond at top */}
        <motion.div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 pointer-events-auto cursor-grab active:cursor-grabbing shadow-2xl border-2 border-white/20"
          style={{ backgroundColor: '#10b981' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Inner shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
        </motion.div>
        
        {/* Visual debugging indicators (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <div 
              className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full animate-ping" 
              title="Playhead Position Marker" 
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-yellow-400 text-[10px] font-mono rounded whitespace-nowrap">
              {position.toFixed(1)}px
            </div>
          </>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default TimelinePlayhead;
