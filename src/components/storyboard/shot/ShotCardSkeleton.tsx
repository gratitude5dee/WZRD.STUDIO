import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShotCardSkeletonProps {
  delay?: number;
}

export const ShotCardSkeleton: React.FC<ShotCardSkeletonProps> = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "relative flex flex-col rounded-[16px] backdrop-blur-sm w-[280px] min-h-[320px]",
        "bg-gradient-to-br from-zinc-900/90 to-zinc-900/70",
        "border border-zinc-800/30",
        "shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]",
        "overflow-hidden"
      )}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Shot number badge skeleton */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="h-5 w-16 rounded-full bg-zinc-800/80 animate-pulse" />
      </div>

      {/* Image area skeleton */}
      <div className="flex-shrink-0 h-[140px] relative bg-zinc-900/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        {/* Pulsing overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content area skeleton */}
      <div className="flex-1 p-3 space-y-3">
        {/* Shot type skeleton */}
        <div className="h-3 w-20 bg-zinc-800/60 rounded animate-pulse" />
        
        {/* Description lines skeleton */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-2 w-5/6 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-2 w-4/6 bg-zinc-800/60 rounded animate-pulse" />
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/30" />

        {/* Action buttons skeleton */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="h-6 w-16 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-6 w-6 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      </div>

      {/* Subtle glow pulse effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[16px]"
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0)',
            '0 0 30px rgba(59, 130, 246, 0.1)',
            '0 0 20px rgba(59, 130, 246, 0)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};
