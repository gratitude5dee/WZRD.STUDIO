import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HandleTooltipProps {
  show: boolean;
  label: string;
  dataType?: 'text' | 'image' | 'video' | 'any';
  position: 'left' | 'right' | 'top' | 'bottom';
  compatibleNodes?: string[];
  className?: string;
}

export const HandleTooltip: React.FC<HandleTooltipProps> = ({
  show,
  label,
  dataType = 'any',
  position,
  compatibleNodes = [],
  className,
}) => {
  const getDataTypeColor = () => {
    switch (dataType) {
      case 'text': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'image': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'video': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 rotate-45 border';
    const colorClasses = getDataTypeColor();
    
    switch (position) {
      case 'left':
        return `${baseClasses} ${colorClasses} -right-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0`;
      case 'right':
        return `${baseClasses} ${colorClasses} -left-1 top-1/2 -translate-y-1/2 border-r-0 border-t-0`;
      case 'top':
        return `${baseClasses} ${colorClasses} left-1/2 -translate-x-1/2 -bottom-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseClasses} ${colorClasses} left-1/2 -translate-x-1/2 -top-1 border-b-0 border-r-0`;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 pointer-events-none whitespace-nowrap',
            getPositionClasses(),
            className
          )}
        >
          <div className={cn(
            'relative px-3 py-2 rounded-lg border backdrop-blur-sm',
            'shadow-lg',
            getDataTypeColor()
          )}>
            {/* Arrow */}
            <div className={getArrowClasses()} />
            
            {/* Content */}
            <div className="text-xs font-medium">
              {label}
              {dataType !== 'any' && (
                <span className="ml-1.5 opacity-70">({dataType})</span>
              )}
            </div>
            
            {/* Compatible nodes */}
            {compatibleNodes.length > 0 && (
              <div className="text-[10px] opacity-60 mt-1">
                Compatible: {compatibleNodes.join(', ')}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
