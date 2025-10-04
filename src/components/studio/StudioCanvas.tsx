
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ConnectionPoint } from '@/types/blockTypes';
import { useBlockDataFlow } from '@/hooks/useBlockDataFlow';
import { ActionTemplate } from '@/types/studioTypes';
import { v4 as uuidv4 } from 'uuid';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  position?: { x: number, y: number };
}

interface StudioCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock?: (block: Block) => void;
}

type ViewMode = 'normal' | 'compact' | 'grid';

interface BlockRef {
  element: HTMLElement;
  connectionPoints: Record<string, { x: number; y: number }>;
}

const StudioCanvas = ({ blocks, selectedBlockId, onSelectBlock, onAddBlock }: StudioCanvasProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{blockId: string, pointId: string, x: number, y: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blockRefs, setBlockRefs] = useState<Record<string, BlockRef>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const {
    connections,
    updateBlockOutput,
    getBlockInput,
    addConnection,
    removeConnection,
    initializeBlock
  } = useBlockDataFlow();

  // Initialize blocks in data flow system
  useEffect(() => {
    blocks.forEach(block => {
      initializeBlock(block.id, block.type, block.position || { x: 0, y: 0 });
    });
  }, [blocks, initializeBlock]);

  // Register block element and its connection points
  const registerBlockRef = useCallback((blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => {
    if (element) {
      setBlockRefs(prev => {
        // Only update if positions have actually changed
        const existing = prev[blockId];
        if (existing && JSON.stringify(existing.connectionPoints) === JSON.stringify(connectionPoints)) {
          return prev;
        }
        return {
          ...prev,
          [blockId]: { element, connectionPoints }
        };
      });
    }
  }, []);

  // Calculate connection path between two points
  const calculateConnectionPath = (start: { x: number; y: number }, end: { x: number; y: number }): string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const curvature = Math.min(distance * 0.5, 100);

    // Horizontal curve
    return `M${start.x},${start.y} C${start.x + curvature},${start.y} ${end.x - curvature},${end.y} ${end.x},${end.y}`;
  };

  // Get absolute position of a connection point
  const getConnectionPointPosition = (blockId: string, pointId: string): { x: number; y: number } | null => {
    const blockRef = blockRefs[blockId];
    if (!blockRef || !canvasRef.current) return null;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const pointPosition = blockRef.connectionPoints[pointId];
    
    if (!pointPosition) return null;

    return {
      x: pointPosition.x - canvasRect.left + canvasRef.current.scrollLeft,
      y: pointPosition.y - canvasRect.top + canvasRef.current.scrollTop
    };
  };
  
  const getColSpan = (blockType: string, index: number): string => {
    if (viewMode === 'normal') {
      return 'col-span-3';
    } else if (viewMode === 'compact') {
      return index % 3 === 0 ? 'col-span-2' : 'col-span-1';
    } else {
      return 'col-span-1';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectBlock('');
    }
  };

  const handleStartConnection = (blockId: string, pointId: string, e: React.MouseEvent) => {
    const position = getConnectionPointPosition(blockId, pointId);
    if (position) {
      setConnectionStart({ blockId, pointId, x: position.x, y: position.y });
      setIsDraggingConnection(true);
      setMousePosition(position);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left + canvasRef.current.scrollLeft,
        y: e.clientY - rect.top + canvasRef.current.scrollTop
      });
    }
  };

  const handleFinishConnection = (blockId: string, pointId: string) => {
    if (connectionStart && blockId !== connectionStart.blockId) {
      const newConnection = {
        id: `${connectionStart.blockId}-${connectionStart.pointId}--${blockId}-${pointId}`,
        sourceBlockId: connectionStart.blockId,
        sourcePointId: connectionStart.pointId,
        targetBlockId: blockId,
        targetPointId: pointId
      };
      
      addConnection(newConnection);
    }
    
    setIsDraggingConnection(false);
    setConnectionStart(null);
  };

  // Create connected nodes based on template
  const handleCreateConnectedNodes = useCallback((sourceBlockId: string, template: ActionTemplate) => {
    if (!onAddBlock) return;
    
    const sourceBlock = blocks.find(b => b.id === sourceBlockId);
    if (!sourceBlock) return;

    const sourcePos = sourceBlock.position || { x: 0, y: 0 };
    
    // Calculate smart positions for new nodes
    const getSmartPosition = (index: number, total: number, role: 'input' | 'output') => {
      const spacing = 150;
      const verticalSpread = (total - 1) * spacing;
      const startY = sourcePos.y - verticalSpread / 2;
      
      return {
        x: role === 'input' ? sourcePos.x - 400 : sourcePos.x + 400,
        y: startY + (index * spacing)
      };
    };

    // Create new blocks
    const newBlockIds: string[] = [];
    template.createNodes.forEach((type, index) => {
      const newBlockId = uuidv4();
      const position = getSmartPosition(index, template.createNodes.length, template.nodeRole);
      
      const newBlock: Block = {
        id: newBlockId,
        type,
        position
      };
      
      onAddBlock(newBlock);
      initializeBlock(newBlockId, type, position);
      newBlockIds.push(newBlockId);
    });

    // Auto-connect the new blocks after a brief delay to ensure they're rendered
    setTimeout(() => {
      newBlockIds.forEach((newBlockId, index) => {
        const connection = template.nodeRole === 'input' 
          ? {
              id: uuidv4(),
              sourceBlockId: newBlockId,
              sourcePointId: 'output',
              targetBlockId: sourceBlockId,
              targetPointId: `input-${index}`
            }
          : {
              id: uuidv4(),
              sourceBlockId: sourceBlockId,
              sourcePointId: 'output',
              targetBlockId: newBlockId,
              targetPointId: 'input'
            };
        
        addConnection(connection);
      });
    }, 100);
  }, [blocks, onAddBlock, addConnection, initializeBlock]);

  // Define connection points for each block type (memoized to prevent re-renders)
  const textBlockConnectionPoints = useMemo<ConnectionPoint[]>(() => [
    { id: 'output', type: 'output', label: 'Text Output', position: 'right' },
    { id: 'input', type: 'input', label: 'Text Input', position: 'left' }
  ], []);

  const imageBlockConnectionPoints = useMemo<ConnectionPoint[]>(() => [
    { id: 'image-output', type: 'output', label: 'Image Output', position: 'right' },
    { id: 'prompt-input', type: 'input', label: 'Prompt Input', position: 'left' }
  ], []);

  const videoBlockConnectionPoints = useMemo<ConnectionPoint[]>(() => [
    { id: 'video-output', type: 'output', label: 'Video Output', position: 'right' },
    { id: 'prompt-input', type: 'input', label: 'Prompt Input', position: 'left' }
  ], []);

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-black overflow-auto p-6 relative"
      style={{ 
        backgroundImage: 'radial-gradient(#333 1px, transparent 0)',
        backgroundSize: '24px 24px',
        backgroundPosition: '-12px -12px'
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        setIsDraggingConnection(false);
        setConnectionStart(null);
      }}
    >
      {/* Connection lines SVG */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ minHeight: '100%', minWidth: '100%' }}
      >
        {/* Static connections */}
        {connections.map((conn) => {
          const startPos = getConnectionPointPosition(conn.sourceBlockId, conn.sourcePointId);
          const endPos = getConnectionPointPosition(conn.targetBlockId, conn.targetPointId);
          
          if (!startPos || !endPos) return null;
          
          const path = calculateConnectionPath(startPos, endPos);
          
          return (
            <g key={conn.id}>
              {/* Glow effect */}
              <path 
                d={path}
                stroke="#9b87f5"
                strokeWidth="10"
                fill="none"
                opacity="0.15"
                filter="blur(4px)"
              />
              {/* Main line */}
              <path 
                d={path}
                stroke="url(#gradient)"
                strokeWidth="2.5"
                fill="none"
                opacity="0.9"
                className="animate-pulse"
              />
              {/* Animated data flow particles */}
              <circle r="3" fill="#d487f5" opacity="0.8">
                <animateMotion 
                  dur="3s" 
                  repeatCount="indefinite"
                  path={path}
                />
              </circle>
            </g>
          );
        })}
        
        {/* Active dragging connection */}
        {isDraggingConnection && connectionStart && (
          <g>
            {/* Glow effect */}
            <path 
              d={calculateConnectionPath(connectionStart, mousePosition)} 
              stroke="#9b87f5"
              strokeWidth="10"
              fill="none"
              opacity="0.15"
              filter="blur(4px)"
            />
            {/* Main line */}
            <path 
              d={calculateConnectionPath(connectionStart, mousePosition)}
              stroke="#9b87f5"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.8"
            />
          </g>
        )}
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9b87f5" />
            <stop offset="100%" stopColor="#d487f5" />
          </linearGradient>
        </defs>
      </svg>

      <div 
        className={cn(
          "max-w-6xl mx-auto py-4 grid grid-cols-3 gap-6 relative z-0",
          viewMode === 'normal' && "grid-cols-1", 
          viewMode === 'compact' && "grid-cols-3",
          viewMode === 'grid' && "grid-cols-3"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.map((block, index) => {
          const colSpan = getColSpan(block.type, index);
          
          if (block.type === 'text') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <TextBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                  supportsConnections={true}
                  connectionPoints={textBlockConnectionPoints}
                  onStartConnection={handleStartConnection}
                  onFinishConnection={handleFinishConnection}
                  onRegisterRef={registerBlockRef}
                  getInput={getBlockInput}
                  setOutput={updateBlockOutput}
                  onCreateConnectedNodes={handleCreateConnectedNodes}
                />
              </motion.div>
            );
          } else if (block.type === 'image') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <ImageBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                  supportsConnections={true}
                  connectionPoints={imageBlockConnectionPoints}
                  onStartConnection={handleStartConnection}
                  onFinishConnection={handleFinishConnection}
                  onRegisterRef={registerBlockRef}
                  getInput={getBlockInput}
                  setOutput={updateBlockOutput}
                />
              </motion.div>
            );
          } else if (block.type === 'video') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <VideoBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                  supportsConnections={true}
                  connectionPoints={videoBlockConnectionPoints}
                  onStartConnection={handleStartConnection}
                  onFinishConnection={handleFinishConnection}
                  onRegisterRef={registerBlockRef}
                  getInput={getBlockInput}
                  setOutput={updateBlockOutput}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default StudioCanvas;
