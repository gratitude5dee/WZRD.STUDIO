import React from 'react';
import { motion } from 'framer-motion';

interface Connection {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

interface BlockConnectorProps {
  connections: Connection[];
  blocks: Array<{ id: string; position: { x: number; y: number } }>;
}

const BlockConnector: React.FC<BlockConnectorProps> = ({ connections, blocks }) => {
  const getBlockCenter = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { x: 0, y: 0 };
    // Assuming block width is ~400px and height is ~300px (adjust as needed)
    return {
      x: block.position.x + 200, // Half of typical block width
      y: block.position.y + 150  // Half of typical block height
    };
  };

  const createCurvePath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  };

  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      style={{ width: '100%', height: '100%', zIndex: 1 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {connections.map((connection) => {
        const start = getBlockCenter(connection.sourceBlockId);
        const end = getBlockCenter(connection.targetBlockId);
        const path = createCurvePath(start, end);

        return (
          <motion.g
            key={connection.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Connection line */}
            <path
              d={path}
              fill="none"
              stroke="rgba(147, 197, 253, 0.4)"
              strokeWidth="2"
              filter="url(#glow)"
            />
            
            {/* Connection points */}
            <circle
              cx={start.x}
              cy={start.y}
              r="4"
              fill="rgba(147, 197, 253, 0.8)"
              className="transition-all duration-200"
            />
            <circle
              cx={end.x}
              cy={end.y}
              r="4"
              fill="rgba(147, 197, 253, 0.8)"
              className="transition-all duration-200"
            />
          </motion.g>
        );
      })}
    </svg>
  );
};

export default BlockConnector;
