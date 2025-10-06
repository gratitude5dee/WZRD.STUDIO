import React from 'react';
import { motion } from 'framer-motion';

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePoint: 'left' | 'right';
  targetPoint: 'left' | 'right';
}

interface TimelineConnectionLinesProps {
  connections: Connection[];
  clipRefs: Map<string, { x: number; y: number; width: number; height: number }>;
}

const TimelineConnectionLines: React.FC<TimelineConnectionLinesProps> = ({ connections, clipRefs }) => {
  const getConnectionPath = (connection: Connection) => {
    const source = clipRefs.get(connection.sourceId);
    const target = clipRefs.get(connection.targetId);

    if (!source || !target) return '';

    const sourceX = connection.sourcePoint === 'left' ? source.x : source.x + source.width;
    const sourceY = source.y + source.height / 2;
    const targetX = connection.targetPoint === 'left' ? target.x : target.x + target.width;
    const targetY = target.y + target.height / 2;

    // Create a smooth Bezier curve
    const controlPointOffset = Math.abs(targetX - sourceX) * 0.5;
    const controlPoint1X = sourceX + controlPointOffset;
    const controlPoint2X = targetX - controlPointOffset;

    return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${sourceY}, ${controlPoint2X} ${targetY}, ${targetX} ${targetY}`;
  };

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
        </linearGradient>
        <filter id="timeline-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {connections.map((connection) => {
        const path = getConnectionPath(connection);
        if (!path) return null;

        return (
          <g key={connection.id}>
            {/* Glow layer */}
            <path 
              d={path} 
              stroke="url(#timeline-gradient)" 
              strokeWidth="6" 
              fill="none"
              opacity="0.4" 
              filter="url(#timeline-glow)" 
            />
            
            {/* Main line */}
            <path 
              d={path} 
              stroke="url(#timeline-gradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Animated flow particle */}
            <motion.circle 
              r="4" 
              fill="#60a5fa"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </motion.circle>
          </g>
        );
      })}
    </svg>
  );
};

export default TimelineConnectionLines;
