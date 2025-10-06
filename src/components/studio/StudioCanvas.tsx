import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { v4 as uuidv4 } from 'uuid';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import { AddBlockDialog } from './AddBlockDialog';
import EmptyCanvasState from './EmptyCanvasState';
import { ConnectionLines } from './ConnectionLines';
import { ConnectionNodeSelector } from './ConnectionNodeSelector';
import { AnimatePresence, motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Connection } from '@/types/blockTypes';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
  initialData?: {
    prompt?: string;
    imageUrl?: string;
    generationTime?: number;
    aspectRatio?: string;
    mode?: string;
    connectedImageUrl?: string;
    connectedImagePrompt?: string;
  };
}

interface StudioCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: (block: Block) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlockPosition: (blockId: string, position: { x: number; y: number }) => void;
  onUpdateBlockData: (blockId: string, data: Partial<Block>) => void;
  blockModels: Record<string, string>;
  onModelChange: (blockId: string, modelId: string) => void;
}

const GRID_SIZE = 20; // Snap-to-grid size
const DRAG_THRESHOLD = 3; // Minimum pixels to move before drag starts (reduced for responsiveness)
const CANVAS_PADDING = 5000; // Padding around blocks for infinite canvas
const SNAP_DISTANCE = 20; // Distance for magnetic snapping to nearby blocks

// Helper function to snap position to grid
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

// Calculate dynamic canvas bounds based on block positions
const calculateCanvasBounds = (blocks: Block[]) => {
  if (blocks.length === 0) {
    return { minX: -CANVAS_PADDING, maxX: CANVAS_PADDING, minY: -CANVAS_PADDING, maxY: CANVAS_PADDING };
  }
  
  const positions = blocks.map(b => b.position);
  const minX = Math.min(...positions.map(p => p.x)) - CANVAS_PADDING;
  const maxX = Math.max(...positions.map(p => p.x)) + CANVAS_PADDING + 400; // +400 for block width
  const minY = Math.min(...positions.map(p => p.y)) - CANVAS_PADDING;
  const maxY = Math.max(...positions.map(p => p.y)) + CANVAS_PADDING + 400; // +400 for block height
  
  return { minX, maxX, minY, maxY };
};

const StudioCanvas = ({ 
  blocks, 
  selectedBlockId, 
  onSelectBlock, 
  onAddBlock, 
  onDeleteBlock,
  onUpdateBlockPosition,
  onUpdateBlockData,
  blockModels, 
  onModelChange 
}: StudioCanvasProps) => {
  const [showAddBlockDialog, setShowAddBlockDialog] = useState(false);
  const [addBlockPosition, setAddBlockPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<any>(null);
  const [localBlocks, setLocalBlocks] = useState(blocks);
  const [interactionMode, setInteractionMode] = useState<'pan' | 'edit'>('pan');
  
  // Connection state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<{
    sourceBlockId: string;
    sourcePoint: 'top' | 'right' | 'bottom' | 'left';
    cursorPosition: { x: number; y: number };
  } | null>(null);
  const [blockRefs, setBlockRefs] = useState<Record<string, { 
    element: HTMLElement; 
    points: Record<string, { x: number; y: number }> 
  }>>({});
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });

  // Zoom controls visibility
  const [showZoomControls, setShowZoomControls] = useState(false);
  const zoomControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showZoomControlsTemporarily = () => {
    setShowZoomControls(true);
    if (zoomControlsTimeoutRef.current) {
      clearTimeout(zoomControlsTimeoutRef.current);
    }
    zoomControlsTimeoutRef.current = setTimeout(() => {
      setShowZoomControls(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (zoomControlsTimeoutRef.current) {
        clearTimeout(zoomControlsTimeoutRef.current);
      }
    };
  }, []);

  // One-way sync: only update local blocks when parent blocks change significantly
  useEffect(() => {
    // Only sync if block count changes or if it's an initial load
    if (blocks.length !== localBlocks.length || localBlocks.length === 0) {
      setLocalBlocks(blocks);
    }
  }, [blocks.length]);

  // Helper functions for connections
  const getCursorPosition = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
    
    return {
      x: (e.clientX - rect.left - transform.positionX) / transform.scale,
      y: (e.clientY - rect.top - transform.positionY) / transform.scale
    };
  };

  const findNearbyConnectionPoint = (
    cursorPos: { x: number; y: number },
    threshold = 40
  ): { blockId: string; point: string } | null => {
    for (const [blockId, blockRef] of Object.entries(blockRefs)) {
      for (const [point, pointPos] of Object.entries(blockRef.points)) {
        const distance = Math.hypot(
          cursorPos.x - pointPos.x,
          cursorPos.y - pointPos.y
        );
        if (distance < threshold) {
          return { blockId, point };
        }
      }
    }
    return null;
  };

  const createConnection = (
    sourceBlockId: string,
    sourcePoint: 'top' | 'right' | 'bottom' | 'left',
    targetBlockId: string,
    targetPoint: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    const sourceBlock = localBlocks.find(b => b.id === sourceBlockId);
    if (!sourceBlock) return;

    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      sourceBlockId,
      targetBlockId,
      sourcePoint,
      targetPoint,
      dataType: sourceBlock.type
    };

    setConnections(prev => [...prev, newConnection]);
    toast.success('Connection created');
  };

  const handleConnectionPointClick = useCallback((blockId: string, point: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => {
    e.stopPropagation();
    const cursorPos = getCursorPosition(e);
    setActiveConnection({
      sourceBlockId: blockId,
      sourcePoint: point,
      cursorPosition: cursorPos
    });
    setInteractionMode('edit');
  }, []);

  const handleRegisterBlockRef = useCallback((
    blockId: string,
    element: HTMLElement | null,
    connectionPoints: Record<string, { x: number; y: number }>
  ) => {
    if (element) {
      setBlockRefs(prev => ({
        ...prev,
        [blockId]: { element, points: connectionPoints }
      }));
    }
  }, []);

  const handleSelectNodeType = (type: 'text' | 'image' | 'video') => {
    if (!activeConnection) return;

    // Determine target connection point based on source point
    const getOppositePoint = (point: 'top' | 'right' | 'bottom' | 'left'): 'top' | 'right' | 'bottom' | 'left' => {
      const opposites = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' } as const;
      return opposites[point];
    };

    const targetPoint = getOppositePoint(activeConnection.sourcePoint);
    
    // Create new block at cursor position
    const newBlockId = `${type}-${Date.now()}`;
    const newBlock: Block = {
      id: newBlockId,
      type,
      position: nodeSelectorPosition,
    };

    setLocalBlocks(prev => [...prev, newBlock]);
    onAddBlock(newBlock);

    // Create connection
    setTimeout(() => {
      createConnection(
        activeConnection.sourceBlockId,
        activeConnection.sourcePoint,
        newBlockId,
        targetPoint
      );
    }, 50);

    setShowNodeSelector(false);
    setActiveConnection(null);
  };

  const getPreviewPath = (activeConn: NonNullable<typeof activeConnection>): string => {
    const sourceRef = blockRefs[activeConn.sourceBlockId];
    if (!sourceRef) return '';

    const sourcePos = sourceRef.points[activeConn.sourcePoint];
    if (!sourcePos) return '';

    const { x: x1, y: y1 } = sourcePos;
    const { x: x2, y: y2 } = activeConn.cursorPosition;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlOffset = Math.min(distance * 0.4, 150);
    
    // Enhanced direction-aware control points
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    const cx1 = isHorizontal ? x1 + controlOffset : x1 + dx * 0.25;
    const cy1 = isHorizontal ? y1 + dy * 0.25 : y1 + controlOffset;
    const cx2 = isHorizontal ? x2 - controlOffset : x2 - dx * 0.25;
    const cy2 = isHorizontal ? y2 - dy * 0.25 : y2 - controlOffset;

    return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Cancel active connection
      if (e.key === 'Escape') {
        if (activeConnection) {
          setActiveConnection(null);
          setShowNodeSelector(false);
          toast.info('Connection cancelled');
          return;
        }
      }

      // Delete/Backspace: remove selected connection or block
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnectionId) {
          e.preventDefault();
          setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
          setSelectedConnectionId(null);
          toast.success('Connection deleted');
          return;
        }
        if (selectedBlockId) {
          e.preventDefault();
          onDeleteBlock(selectedBlockId);
          setLocalBlocks(prev => prev.filter(b => b.id !== selectedBlockId));
          onSelectBlock('');
          toast.success('Block deleted');
          return;
        }
      }

      // Cmd/Ctrl + D: duplicate selected block
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        const blockToDuplicate = localBlocks.find(b => b.id === selectedBlockId);
        if (blockToDuplicate) {
          const newBlock = {
            ...blockToDuplicate,
            id: uuidv4(),
            position: {
              x: blockToDuplicate.position.x + 40,
              y: blockToDuplicate.position.y + 40
            }
          };
          setLocalBlocks(prev => [...prev, newBlock]);
          onAddBlock(newBlock);
          toast.success('Block duplicated');
        }
      }

      // Arrow keys: nudge 10px
      if (selectedBlockId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const block = localBlocks.find(b => b.id === selectedBlockId);
        if (block) {
          let newX = block.position.x;
          let newY = block.position.y;
          
          if (e.key === 'ArrowUp') newY -= 10;
          if (e.key === 'ArrowDown') newY += 10;
          if (e.key === 'ArrowLeft') newX -= 10;
          if (e.key === 'ArrowRight') newX += 10;

          const newPosition = { x: snapToGrid(newX), y: snapToGrid(newY) };
          onUpdateBlockPosition(selectedBlockId, newPosition);
          setLocalBlocks(prev => prev.map(b => 
            b.id === selectedBlockId ? { ...b, position: newPosition } : b
          ));
        }
      }

      // G: toggle grid
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev);
        toast.info(showGrid ? 'Grid hidden' : 'Grid visible');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, selectedConnectionId, activeConnection, localBlocks, showGrid, onSelectBlock, onAddBlock]);

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && transformRef.current) {
        const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
        const x = (e.clientX - rect.left - transform.positionX) / transform.scale;
        const y = (e.clientY - rect.top - transform.positionY) / transform.scale;
        
        setAddBlockPosition({ x: snapToGrid(x), y: snapToGrid(y) });
        setShowAddBlockDialog(true);
      }
    }
  };

  const handleSelectBlockType = (type: 'text' | 'image' | 'video') => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      position: addBlockPosition
    };
    setLocalBlocks(prev => [...prev, newBlock]);
    onAddBlock(newBlock);
    setShowAddBlockDialog(false);
    onSelectBlock(newBlock.id);
  };

  const handleSpawnBlocks = useCallback((newBlocks: Block[]) => {
    setLocalBlocks(prev => [...prev, ...newBlocks]);
    newBlocks.forEach(block => onAddBlock(block));
  }, [onAddBlock]);

  const handleBlockMouseDown = (blockId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('drag-handle') || 
        (e.target as HTMLElement).closest('.drag-handle')) {
      e.stopPropagation();
      const block = localBlocks.find(b => b.id === blockId);
      if (block && canvasRef.current && transformRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
        const mouseX = (e.clientX - rect.left - transform.positionX) / transform.scale;
        const mouseY = (e.clientY - rect.top - transform.positionY) / transform.scale;
        
        setDraggedBlockId(blockId);
        setDragStartPos({ x: mouseX, y: mouseY });
        setDragOffset({
          x: mouseX - block.position.x,
          y: mouseY - block.position.y
        });
        setInteractionMode('edit');
        onSelectBlock(blockId);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Update active connection cursor position
    if (activeConnection) {
      const cursorPos = getCursorPosition(e);
      setActiveConnection(prev => prev ? { ...prev, cursorPosition: cursorPos } : null);
      return;
    }

    if (draggedBlockId && dragStartPos && canvasRef.current && transformRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
      const mouseX = (e.clientX - rect.left - transform.positionX) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.positionY) / transform.scale;
      
      // Check drag threshold before starting actual drag
      const deltaX = Math.abs(mouseX - dragStartPos.x);
      const deltaY = Math.abs(mouseY - dragStartPos.y);
      
      if (!isDragging && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
        setIsDragging(true);
      }
      
      if (isDragging) {
        let newX = snapToGrid(mouseX - dragOffset.x);
        let newY = snapToGrid(mouseY - dragOffset.y);
        
        // Find alignment guides (magnetic snapping to nearby blocks)
        const guides = { x: [] as number[], y: [] as number[] };
        const otherBlocks = localBlocks.filter(b => b.id !== draggedBlockId);
        
        otherBlocks.forEach(block => {
          // Check X alignment
          if (Math.abs(block.position.x - newX) < SNAP_DISTANCE) {
            newX = block.position.x;
            guides.x.push(block.position.x);
          }
          // Check Y alignment
          if (Math.abs(block.position.y - newY) < SNAP_DISTANCE) {
            newY = block.position.y;
            guides.y.push(block.position.y);
          }
        });
        
        setAlignmentGuides(guides);
        
        setLocalBlocks(prev => prev.map(b => {
          if (b.id === draggedBlockId) {
            return { ...b, position: { x: newX, y: newY } };
          }
          return b;
        }));
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Handle connection drawing mode
    if (activeConnection) {
      const cursorPos = getCursorPosition(e);
      const nearbyPoint = findNearbyConnectionPoint(cursorPos);
      
      if (nearbyPoint && nearbyPoint.blockId !== activeConnection.sourceBlockId) {
        // Connect to existing block
        createConnection(
          activeConnection.sourceBlockId,
          activeConnection.sourcePoint,
          nearbyPoint.blockId,
          nearbyPoint.point as 'top' | 'right' | 'bottom' | 'left'
        );
      } else {
        // Show node selector menu
        setNodeSelectorPosition(cursorPos);
        setShowNodeSelector(true);
      }
      
      setActiveConnection(null);
      setInteractionMode('pan');
      return;
    }

    if (draggedBlockId && isDragging) {
      const block = localBlocks.find(b => b.id === draggedBlockId);
      if (block) {
        onUpdateBlockPosition(draggedBlockId, block.position);
      }
    }
    setDraggedBlockId(null);
    setDragStartPos(null);
    setIsDragging(false);
    setAlignmentGuides({ x: [], y: [] });
    setInteractionMode('pan');
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-black" ref={canvasRef}>
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.25}
        maxScale={2}
        limitToBounds={false}
        onZoom={showZoomControlsTemporarily}
        doubleClick={{ disabled: true }}
        panning={{ disabled: interactionMode === 'edit' }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Connection Lines */}
            <ConnectionLines
              connections={connections}
              blockRefs={blockRefs}
              selectedConnectionId={selectedConnectionId}
              onSelectConnection={setSelectedConnectionId}
            />

            {/* Active Connection Preview */}
            {activeConnection && (
              <svg className="absolute inset-0 pointer-events-none z-30" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="preview-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  </linearGradient>
                  <filter id="preview-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Enhanced dashed preview line with marching ants */}
                <path
                  d={getPreviewPath(activeConnection)}
                  stroke="url(#preview-gradient)"
                  strokeWidth="2.5"
                  strokeDasharray="8 4"
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#preview-glow)"
                  opacity="0.8"
                  style={{
                    animation: 'dash 20s linear infinite'
                  }}
                />
                
                {/* Enhanced pulsing source point indicator */}
                <circle
                  cx={(() => {
                    const sourceBlock = blockRefs[activeConnection.sourceBlockId];
                    return sourceBlock?.points[activeConnection.sourcePoint]?.x || 0;
                  })()}
                  cy={(() => {
                    const sourceBlock = blockRefs[activeConnection.sourceBlockId];
                    return sourceBlock?.points[activeConnection.sourcePoint]?.y || 0;
                  })()}
                  r="12"
                  fill="url(#preview-gradient)"
                  opacity="0.4"
                  filter="url(#preview-glow)"
                >
                  <animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Animated dot following the cursor with glow */}
                <circle
                  cx={activeConnection.cursorPosition.x}
                  cy={activeConnection.cursorPosition.y}
                  r="5"
                  fill="#60a5fa"
                  filter="url(#preview-glow)"
                >
                  <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;1;0.9" dur="1s" repeatCount="indefinite" />
                </circle>
                
                {/* Cursor hint badge */}
                <foreignObject
                  x={activeConnection.cursorPosition.x + 15}
                  y={activeConnection.cursorPosition.y - 12}
                  width="150"
                  height="30"
                >
                  <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-300 font-medium shadow-lg whitespace-nowrap">
                    Release to create block
                  </div>
                </foreignObject>
              </svg>
            )}

            {/* Node Selector Menu */}
            {showNodeSelector && (
              <ConnectionNodeSelector
                position={nodeSelectorPosition}
                onSelectType={handleSelectNodeType}
                onNavigate={() => {
                  setShowNodeSelector(false);
                  setActiveConnection(null);
                }}
                onCancel={() => {
                  setShowNodeSelector(false);
                  setActiveConnection(null);
                }}
              />
            )}

            {/* Zoom Controls */}
            <AnimatePresence>
              {showZoomControls && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-2 shadow-lg"
                >
                  <button
                    onClick={() => { zoomIn(); showZoomControlsTemporarily(); }}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-zinc-300" />
                  </button>
                  <button
                    onClick={() => { zoomOut(); showZoomControlsTemporarily(); }}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-zinc-300" />
                  </button>
                  <button
                    onClick={() => { resetTransform(); showZoomControlsTemporarily(); }}
                    className="p-2 hover:bg-zinc-800 rounded transition-colors"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-4 h-4 text-zinc-300" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div 
                className="canvas-bg w-full h-full relative"
                style={{
                  backgroundColor: 'hsl(220, 25%, 6%)',
                  backgroundImage: showGrid 
                    ? `radial-gradient(circle, rgba(113, 113, 122, 0.25) 1.5px, transparent 1.5px)`
                    : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto',
                  backgroundPosition: 'center center',
                  minWidth: `${calculateCanvasBounds(localBlocks).maxX - calculateCanvasBounds(localBlocks).minX}px`,
                  minHeight: `${calculateCanvasBounds(localBlocks).maxY - calculateCanvasBounds(localBlocks).minY}px`,
                  cursor: interactionMode === 'pan' ? 'grab' : 'default'
                }}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Alignment Guides */}
                {alignmentGuides.x.map((x, i) => (
                  <div
                    key={`guide-x-${i}`}
                    className="absolute top-0 bottom-0 w-[1px] bg-blue-500/50 pointer-events-none z-50"
                    style={{ left: x }}
                  />
                ))}
                {alignmentGuides.y.map((y, i) => (
                  <div
                    key={`guide-y-${i}`}
                    className="absolute left-0 right-0 h-[1px] bg-blue-500/50 pointer-events-none z-50"
                    style={{ top: y }}
                  />
                ))}
                {/* Empty Canvas State */}
                {localBlocks.length === 0 && (
                  <EmptyCanvasState onAddBlock={handleSelectBlockType} />
                )}

                {/* Mode Indicator */}
                <div className="fixed bottom-6 left-6 z-50 px-3 py-1.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg text-xs text-zinc-400">
                  Mode: <span className="text-zinc-200 font-medium">{interactionMode === 'pan' ? 'Navigate (Space+Drag)' : 'Edit Block'}</span>
                </div>

                {/* Render Blocks */}
                {localBlocks.map((block) => {
                  const blockConnections = connections.filter(
                    c => c.sourceBlockId === block.id || c.targetBlockId === block.id
                  );
                  const connectedPoints = [
                    ...blockConnections.filter(c => c.sourceBlockId === block.id).map(c => c.sourcePoint),
                    ...blockConnections.filter(c => c.targetBlockId === block.id).map(c => c.targetPoint),
                  ];
                  
                  return (
                    <div
                      key={block.id}
                      style={{
                        position: 'absolute',
                        left: block.position.x,
                        top: block.position.y,
                        opacity: draggedBlockId === block.id && isDragging ? 0.5 : 1,
                        transform: draggedBlockId === block.id && isDragging ? 'scale(1.02)' : 'scale(1)',
                        transition: draggedBlockId === block.id ? 'none' : 'transform 0.2s ease'
                      }}
                      onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
                    >
                      {block.type === 'text' && (
                        <TextBlock
                          id={block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          isSelected={selectedBlockId === block.id}
                          selectedModel={blockModels[block.id]}
                          onModelChange={(modelId) => onModelChange(block.id, modelId)}
                          initialData={block.initialData}
                          onRegisterRef={handleRegisterBlockRef}
                          onConnectionPointClick={handleConnectionPointClick}
                          connectedPoints={connectedPoints}
                        />
                      )}
                      {block.type === 'image' && (
                        <ImageBlock
                          id={block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          isSelected={selectedBlockId === block.id}
                          selectedModel={blockModels[block.id]}
                          onModelChange={(modelId) => onModelChange(block.id, modelId)}
                          onSpawnBlocks={handleSpawnBlocks}
                          blockPosition={block.position}
                          initialData={block.initialData}
                          displayMode={block.initialData?.imageUrl ? 'display' : 'input'}
                          onRegisterRef={handleRegisterBlockRef}
                          onConnectionPointClick={handleConnectionPointClick}
                          connectedPoints={connectedPoints}
                        />
                      )}
                      {block.type === 'video' && (
                        <VideoBlock
                          id={block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          isSelected={selectedBlockId === block.id}
                          selectedModel={blockModels[block.id]}
                          onModelChange={(modelId) => onModelChange(block.id, modelId)}
                          onRegisterRef={handleRegisterBlockRef}
                          onConnectionPointClick={handleConnectionPointClick}
                          connectedPoints={connectedPoints}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Add Block Dialog */}
      <AddBlockDialog
        isOpen={showAddBlockDialog}
        onClose={() => setShowAddBlockDialog(false)}
        onSelectBlockType={handleSelectBlockType}
        position={addBlockPosition}
      />
    </div>
  );
};

export default StudioCanvas;
