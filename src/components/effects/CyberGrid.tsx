import { motion } from 'framer-motion';

export const CyberGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full opacity-10">
        <defs>
          <pattern id="cyber-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-cyan-400"
            />
          </pattern>
          
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(180 100% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(180 100% 50%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(180 100% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        <rect width="100%" height="100%" fill="url(#grid-gradient)" />
      </svg>
      
      {/* Animated scan line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
