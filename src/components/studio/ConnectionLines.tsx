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
          <React.Fragment key={connection.id}>
            <linearGradient
              id={getGradientId(connection)}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
            </linearGradient>
            <filter id={`glow-${connection.id}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </React.Fragment>
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
              strokeWidth="10"
              opacity="0.25"
              filter={`url(#glow-${connection.id})`}
              pointerEvents="none"
            />
            
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${getGradientId(connection)})`}
              strokeWidth={isSelected ? "3.5" : "2"}
              strokeLinecap="round"
              className="pointer-events-auto cursor-pointer transition-all duration-300"
              style={{
                strokeWidth: isSelected ? '3.5px' : '2px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.strokeWidth = '3.5px';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.strokeWidth = '2px';
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(connection.id);
              }}
            />
            
            {/* Animated flow dots - forward */}
            <circle r="3" fill="#60a5fa" opacity="0.95">
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path={path}
              />
            </circle>
            
            {/* Animated flow dots - backward */}
            <circle r="3" fill="#8b5cf6" opacity="0.95">
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path={path}
                keyPoints="1;0"
                keyTimes="0;1"
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
