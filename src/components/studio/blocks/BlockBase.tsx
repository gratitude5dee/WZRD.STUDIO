
import React, { useState } from 'react';
import { HelpCircle, History, Image, Clock, Plus } from 'lucide-react';
import { motion, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ConnectionPoint {
  id: string;
  type: 'input' | 'output';
  label: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface BlockProps {
  id: string;
  type: 'text' | 'image' | 'video';
  title: string;
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
  generationTime?: string;
  supportsConnections?: boolean;
  connectionPoints?: ConnectionPoint[];
  onShowHistory?: () => void;
  onStartConnection?: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onFinishConnection?: (blockId: string, pointId: string) => void;
  position?: { x: number, y: number };
  onDragEnd?: (position: { x: number, y: number }) => void;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  promptDisplay?: string;
  estimatedTime?: string;
}

const BlockBase: React.FC<BlockProps> = ({ 
  id, 
  type, 
  title, 
  children, 
  onSelect,
  isSelected,
  generationTime,
  supportsConnections = false,
  connectionPoints = [],
  onShowHistory,
  onStartConnection,
  onFinishConnection,
  position = { x: 0, y: 0 },
  onDragEnd,
  onRegisterRef,
  promptDisplay,
  estimatedTime
}) => {
  const [showConnections, setShowConnections] = useState(false);
  const dragControls = useDragControls();
  const blockRef = React.useRef<HTMLDivElement>(null);
  const connectionPointRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Register block and connection point positions with parent
  React.useEffect(() => {
    if (onRegisterRef && blockRef.current) {
      const updatePositions = () => {
        const positions: Record<string, { x: number; y: number }> = {};
        
        Object.entries(connectionPointRefs.current).forEach(([pointId, element]) => {
          if (element) {
            const rect = element.getBoundingClientRect();
            positions[pointId] = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          }
        });
        
        onRegisterRef(id, blockRef.current, positions);
      };

      // Initial registration
      updatePositions();

      // Update on window resize or scroll
      window.addEventListener('resize', updatePositions);
      return () => window.removeEventListener('resize', updatePositions);
    }
  }, [id, onRegisterRef]);

  const handleConnectionStart = (pointId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartConnection) {
      onStartConnection(id, pointId, e);
    }
  };

  const handleConnectionEnd = (pointId: string) => {
    if (onFinishConnection) {
      onFinishConnection(id, pointId);
    }
  };

  return (
    <div
      ref={blockRef}
      className={cn(
        "w-full min-h-[16rem] rounded-lg bg-canvas-block border overflow-hidden shadow-lg mb-4 relative",
        isSelected ? 'border-canvas-accent-blue' : 'border-canvas-connector-default'
      )}
      onClick={onSelect}
      onMouseEnter={() => supportsConnections && setShowConnections(true)}
      onMouseLeave={() => supportsConnections && setShowConnections(false)}
    >
      <div 
        className="bg-canvas-bg/50 px-4 py-2 flex items-center justify-between cursor-move border-b border-canvas-connector-default select-none"
        onMouseDown={(e) => {
          e.stopPropagation();
          // This div is the drag handle - no special action needed, parent handles movement
        }}
      >
        <div className="flex items-center">
          <h3 className="text-xs font-semibold text-canvas-text-primary uppercase tracking-wide">{title}</h3>
          {generationTime && !promptDisplay && (
            <div className="ml-2 flex items-center text-xs text-canvas-text-secondary">
              <Clock className="h-3 w-3 mr-1" />
              {generationTime}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onShowHistory && (
            <button 
              className="text-canvas-text-secondary hover:text-canvas-text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory();
              }}
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button className="text-canvas-text-secondary hover:text-canvas-text-primary transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Prompt Display - Shows when generating */}
      {promptDisplay && (
        <div className="px-4 py-2.5 bg-canvas-bg/30 border-b border-canvas-connector-default flex items-center justify-between">
          <span className="text-sm text-canvas-text-primary font-medium">{promptDisplay}</span>
          {estimatedTime && (
            <span className="text-sm text-canvas-text-secondary">{estimatedTime}</span>
          )}
        </div>
      )}
      
      <div 
        className="p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      
      {/* Connection Points */}
      {(supportsConnections || showConnections) && connectionPoints.map(point => {
        let positionClasses = '';
        
        switch(point.position) {
          case 'top':
            positionClasses = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
          case 'right':
            positionClasses = 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2';
            break;
          case 'bottom':
            positionClasses = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
            break;
          case 'left':
            positionClasses = 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
        }
        
        return (
          <div 
            key={point.id}
            ref={(el) => connectionPointRefs.current[point.id] = el}
            className={cn(
              "absolute w-3 h-3 rounded-full z-10 cursor-pointer transition-all duration-200",
              positionClasses,
              point.type === 'input' 
                ? 'bg-canvas-accent-blue hover:bg-canvas-accent-blue/80 hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                : 'bg-canvas-accent-purple hover:bg-canvas-accent-purple/80 hover:shadow-[0_0_8px_rgba(139,92,246,0.6)]'
            )}
            title={point.label}
            onMouseDown={(e) => point.type === 'output' && handleConnectionStart(point.id, e)}
            onClick={() => point.type === 'input' && handleConnectionEnd(point.id)}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold">
              +
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BlockBase;
