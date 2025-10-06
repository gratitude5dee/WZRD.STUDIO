import React from 'react';
import { Connection } from '@/types/blockTypes';
import { motion } from 'framer-motion';

interface ConnectionLinesProps {
  connections: Connection[];
  blockRefs: Record<string, { element: HTMLElement; points: Record<string, { x: number; y: number }> }>;
  selectedConnectionId: string | null;
  onSelectConnection: (id: string | null) => void;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  blockRefs,
  selectedConnectionId,
  onSelectConnection
}) => {
  const getConnectionPath = (connection: Connection): string | null => {
    const sourceBlock = blockRefs[connection.sourceBlockId];
    const targetBlock = blockRefs[connection.targetBlockId];
    
    if (!sourceBlock || !targetBlock) return null;

    const sourceRect = sourceBlock.element.getBoundingClientRect();
    const targetRect = targetBlock.element.getBoundingClientRect();
    
    // Calculate connection point positions
    const getPointPosition = (rect: DOMRect, point: 'top' | 'right' | 'bottom' | 'left') => {
      switch (point) {
        case 'top':
          return { x: rect.left + rect.width / 2, y: rect.top };
        case 'right':
          return { x: rect.right, y: rect.top + rect.height / 2 };
        case 'bottom':
          return { x: rect.left + rect.width / 2, y: rect.bottom };
        case 'left':
          return { x: rect.left, y: rect.top + rect.height / 2 };
      }
    };
    
    const startPos = getPointPosition(sourceRect, connection.sourcePoint);
    const endPos = getPointPosition(targetRect, connection.targetPoint);
    
    // Calculate control points for smooth Bezier curve
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    
    let controlPoint1, controlPoint2;
    
    if (connection.sourcePoint === 'right' && connection.targetPoint === 'left') {
      // Horizontal connection
      const offset = Math.abs(dx) * 0.5;
      controlPoint1 = { x: startPos.x + offset, y: startPos.y };
      controlPoint2 = { x: endPos.x - offset, y: endPos.y };
    } else if (connection.sourcePoint === 'bottom' && connection.targetPoint === 'top') {
      // Vertical connection
      const offset = Math.abs(dy) * 0.5;
      controlPoint1 = { x: startPos.x, y: startPos.y + offset };
      controlPoint2 = { x: endPos.x, y: endPos.y - offset };
    } else {
      // Default smooth curve
      const offset = Math.max(Math.abs(dx), Math.abs(dy)) * 0.3;
      controlPoint1 = { x: startPos.x + offset, y: startPos.y };
      controlPoint2 = { x: endPos.x - offset, y: endPos.y };
    }
    
    return `M ${startPos.x} ${startPos.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPos.x} ${endPos.y}`;
  };

  const getGradientId = (connection: Connection) => `gradient-${connection.id}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        {connections.map((connection) => (
          <linearGradient
            key={getGradientId(connection)}
            id={getGradientId(connection)}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
        ))}
      </defs>
      
      {connections.map((connection) => {
        const path = getConnectionPath(connection);
        if (!path) return null;
        
        const isSelected = selectedConnectionId === connection.id;
        
        return (
          <g key={connection.id}>
            {/* Glow effect */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${getGradientId(connection)})`}
              strokeWidth={isSelected ? 12 : 10}
              opacity={0.15}
              filter="blur(4px)"
            />
            
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${getGradientId(connection)})`}
              strokeWidth={isSelected ? 3 : 2.5}
              strokeLinecap="round"
              className="pointer-events-auto cursor-pointer hover:stroke-[4px] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(connection.id);
              }}
            />
            
            {/* Animated flow dots */}
            <circle r="4" fill="#60a5fa">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={path}
              />
            </circle>
            <circle r="4" fill="#a855f7">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin="0.5s"
                path={path}
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
