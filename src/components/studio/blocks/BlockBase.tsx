
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
  onRegisterRef
}) => {
  const [showConnections, setShowConnections] = useState(false);
  const dragControls = useDragControls();
  const blockRef = React.useRef<HTMLDivElement>(null);
  const connectionPointRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Register block and connection point positions with parent
  React.useEffect(() => {
    if (onRegisterRef && blockRef.current) {
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
    }
  }, [id, onRegisterRef, connectionPoints]);

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
    <motion.div
      ref={blockRef}
      className={`w-full min-h-[16rem] rounded-lg bg-zinc-900 border ${isSelected ? 'border-blue-500' : 'border-zinc-800'} 
                  overflow-hidden shadow-md mb-4 relative`}
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={(e, info) => {
        if (onDragEnd) {
          onDragEnd({ x: info.point.x, y: info.point.y });
        }
      }}
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      onMouseEnter={() => supportsConnections && setShowConnections(true)}
      onMouseLeave={() => supportsConnections && setShowConnections(false)}
    >
      <div 
        className="bg-zinc-800 px-4 py-2 flex items-center justify-between cursor-move"
        onPointerDown={(e) => {
          dragControls.start(e);
          e.stopPropagation();
        }}
      >
        <div className="flex items-center">
          <h3 className="text-xs font-semibold text-zinc-400">{title}</h3>
          {generationTime && (
            <div className="ml-2 flex items-center text-xs text-zinc-500">
              <Clock className="h-3 w-3 mr-1" />
              {generationTime}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onShowHistory && (
            <button 
              className="text-zinc-500 hover:text-zinc-300"
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory();
              }}
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button className="text-zinc-500 hover:text-zinc-300">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {children}
      </div>
      
      {/* Connection Points */}
      {(supportsConnections || showConnections) && connectionPoints.map(point => {
        let positionClasses = '';
        let glowColor = point.type === 'input' ? 'shadow-[0_0_10px_rgba(155,135,245,0.5)]' : 'shadow-[0_0_10px_rgba(212,135,245,0.5)]';
        
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
              "absolute w-4 h-4 rounded-full z-10 cursor-pointer transition-all duration-300",
              positionClasses,
              glowColor,
              point.type === 'input' ? 'bg-[#9b87f5] hover:bg-[#a597f7]' : 'bg-[#d487f5] hover:bg-[#dc9ff8]'
            )}
            title={point.label}
            onMouseDown={(e) => point.type === 'output' && handleConnectionStart(point.id, e)}
            onClick={() => point.type === 'input' && handleConnectionEnd(point.id)}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">
              {point.type === 'input' ? '+' : '→'}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
};

export default BlockBase;
