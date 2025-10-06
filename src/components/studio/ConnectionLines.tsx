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
    
    // Enhanced Bezier curve with direction-aware control points
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    const controlOffset = Math.min(distance * 0.4, 150);
    
    let controlPoint1, controlPoint2;
    
    if (isHorizontal) {
      // Horizontal-dominant connections
      controlPoint1 = { x: startPos.x + controlOffset, y: startPos.y + dy * 0.25 };
      controlPoint2 = { x: endPos.x - controlOffset, y: endPos.y - dy * 0.25 };
    } else {
      // Vertical-dominant connections
      controlPoint1 = { x: startPos.x + dx * 0.25, y: startPos.y + controlOffset };
      controlPoint2 = { x: endPos.x - dx * 0.25, y: endPos.y - controlOffset };
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
              stroke={isSelected ? '#3b82f6' : `url(#${getGradientId(connection)})`}
              strokeWidth={isSelected ? "6" : "5"}
              opacity="0.4"
              filter={`url(#glow-${connection.id})`}
              pointerEvents="none"
            />
            
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={isSelected ? '#60a5fa' : `url(#${getGradientId(connection)})`}
              strokeWidth={isSelected ? "3.5" : "2.5"}
              strokeLinecap="round"
              className="pointer-events-auto cursor-pointer transition-all duration-300"
              style={{
                strokeWidth: isSelected ? '3.5px' : '2.5px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.strokeWidth = '4px';
                e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.strokeWidth = '2.5px';
                  e.currentTarget.style.filter = 'none';
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(connection.id);
              }}
            />
            
            {/* Animated flow indicator - directional arrow */}
            <g opacity="0.9">
              <circle r="4" fill="#60a5fa">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={path}
                />
              </circle>
              {/* Trailing glow */}
              <circle r="6" fill="#60a5fa" opacity="0.3">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={path}
                  begin="0.1s"
                />
              </circle>
            </g>
            
            {/* Secondary flow indicator with offset */}
            <g opacity="0.7">
              <circle r="3" fill="#8b5cf6">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={path}
                  begin="1.5s"
                />
              </circle>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
