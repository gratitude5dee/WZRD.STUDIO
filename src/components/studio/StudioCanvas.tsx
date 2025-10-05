import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { v4 as uuidv4 } from 'uuid';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import { AddBlockDialog } from './AddBlockDialog';
import EmptyCanvasState from './EmptyCanvasState';
import { AnimatePresence, motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import BlockConnector from './blocks/BlockConnector';
import { ActionTemplate } from '@/types/studioTypes';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
}

interface Connection {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

interface StudioCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: (block: Block) => void;
  onTemplateApplied?: (template: ActionTemplate) => void;
  selectedTemplate?: ActionTemplate | null;
}

const GRID_SIZE = 20; // Snap-to-grid size

// Helper function to snap position to grid
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const StudioCanvas = ({ blocks, selectedBlockId, onSelectBlock, onAddBlock, onTemplateApplied, selectedTemplate }: StudioCanvasProps) => {
  const [showAddBlockDialog, setShowAddBlockDialog] = useState(false);
  const [addBlockPosition, setAddBlockPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<any>(null);
  const [localBlocks, setLocalBlocks] = useState(blocks);
  const [connections, setConnections] = useState<Connection[]>([]);

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

  // Sync with parent
  useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace: remove selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        e.preventDefault();
        setLocalBlocks(prev => prev.filter(b => b.id !== selectedBlockId));
        onSelectBlock('');
        toast.success('Block deleted');
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
        setLocalBlocks(prev => prev.map(b => {
          if (b.id === selectedBlockId) {
            let newX = b.position.x;
            let newY = b.position.y;
            
            if (e.key === 'ArrowUp') newY -= 10;
            if (e.key === 'ArrowDown') newY += 10;
            if (e.key === 'ArrowLeft') newX -= 10;
            if (e.key === 'ArrowRight') newX += 10;

            return { ...b, position: { x: snapToGrid(newX), y: snapToGrid(newY) } };
          }
          return b;
        }));
      }

      // G: toggle grid
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev);
        toast.info(showGrid ? 'Grid hidden' : 'Grid visible');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, localBlocks, showGrid, onSelectBlock, onAddBlock]);

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

  const handleBlockMouseDown = (blockId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('cursor-move') || 
        (e.target as HTMLElement).closest('.cursor-move')) {
      const block = localBlocks.find(b => b.id === blockId);
      if (block && canvasRef.current && transformRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
        const mouseX = (e.clientX - rect.left - transform.positionX) / transform.scale;
        const mouseY = (e.clientY - rect.top - transform.positionY) / transform.scale;
        
        setDraggedBlockId(blockId);
        setDragOffset({
          x: mouseX - block.position.x,
          y: mouseY - block.position.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedBlockId && canvasRef.current && transformRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const transform = transformRef.current?.state || { positionX: 0, positionY: 0, scale: 1 };
      const mouseX = (e.clientX - rect.left - transform.positionX) / transform.scale;
      const mouseY = (e.clientY - rect.top - transform.positionY) / transform.scale;
      
      setLocalBlocks(prev => prev.map(b => {
        if (b.id === draggedBlockId) {
          return {
            ...b,
            position: {
              x: snapToGrid(mouseX - dragOffset.x),
              y: snapToGrid(mouseY - dragOffset.y)
            }
          };
        }
        return b;
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedBlockId(null);
  };

  // Handle creating connected nodes when a template is selected
  const handleCreateConnectedNodes = (template: ActionTemplate, targetBlockId: string) => {
    if (template.id === 'image-question') {
      // Create an image block to the left of the text block
      const targetBlock = localBlocks.find(b => b.id === targetBlockId);
      if (!targetBlock) return;

      const imageBlock: Block = {
        id: uuidv4(),
        type: 'image',
        position: {
          x: targetBlock.position.x - 450, // Position to the left
          y: targetBlock.position.y
        }
      };

      // Add the image block
      setLocalBlocks(prev => [...prev, imageBlock]);
      onAddBlock(imageBlock);

      // Create a connection from image block to text block
      const newConnection: Connection = {
        id: uuidv4(),
        sourceBlockId: imageBlock.id,
        targetBlockId: targetBlockId,
        sourcePosition: imageBlock.position,
        targetPosition: targetBlock.position
      };

      setConnections(prev => [...prev, newConnection]);
      toast.success('Image block connected');
    }
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
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
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
                className="canvas-bg w-full h-full relative bg-zinc-950"
                style={{
                  backgroundImage: showGrid 
                    ? `radial-gradient(circle, rgba(113, 113, 122, 0.15) 1px, transparent 1px)`
                    : 'none',
                  backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
                  minWidth: '4000px',
                  minHeight: '4000px'
                }}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Connections */}
                <BlockConnector connections={connections} blocks={localBlocks} />

                {/* Empty Canvas State */}
                {localBlocks.length === 0 && (
                  <EmptyCanvasState onAddBlock={handleSelectBlockType} />
                )}

                {/* Render Blocks */}
                {localBlocks.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      position: 'absolute',
                      left: block.position.x,
                      top: block.position.y,
                      cursor: draggedBlockId === block.id ? 'grabbing' : 'default'
                    }}
                    onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
                  >
                    {block.type === 'text' && (
                      <TextBlock
                        id={block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        isSelected={selectedBlockId === block.id}
                        onCreateConnectedNodes={handleCreateConnectedNodes}
                        onTemplateApplied={onTemplateApplied}
                        selectedTemplate={selectedBlockId === block.id ? selectedTemplate : null}
                      />
                    )}
                    {block.type === 'image' && (
                      <ImageBlock
                        id={block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        isSelected={selectedBlockId === block.id}
                      />
                    )}
                    {block.type === 'video' && (
                      <VideoBlock
                        id={block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        isSelected={selectedBlockId === block.id}
                      />
                    )}
                  </div>
                ))}
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
