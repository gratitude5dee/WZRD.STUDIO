import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Maximize, Grid3x3 } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ReactFlowTextNode } from './nodes/ReactFlowTextNode';
import { ReactFlowImageNode } from './nodes/ReactFlowImageNode';
import { ReactFlowVideoNode } from './nodes/ReactFlowVideoNode';
import { StudioEdge } from './edges/StudioEdge';
import { CustomConnectionLine } from './ConnectionLine';
import { ConnectionNodeSelector } from './ConnectionNodeSelector';
import { useConnectionValidation } from '@/hooks/useConnectionValidation';
import { v4 as uuidv4 } from 'uuid';
import EmptyCanvasState from './EmptyCanvasState';

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
  onDeleteBlock: (id: string) => void;
  onUpdateBlockPosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateBlockData: (id: string, data: Partial<Block>) => void;
  blockModels: Record<string, string>;
  onModelChange: (blockId: string, modelId: string) => void;
}

// Node types configuration (outside component for React Flow optimization)
const nodeTypes: NodeTypes = {
  text: ReactFlowTextNode,
  image: ReactFlowImageNode,
  video: ReactFlowVideoNode,
};

// Edge types configuration
const edgeTypes: EdgeTypes = {
  studio: StudioEdge,
};

// Default edge options
const defaultEdgeOptions = {
  type: 'studio',
  animated: false,
};

const StudioCanvasInner: React.FC<StudioCanvasProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onUpdateBlockPosition,
  onUpdateBlockData,
  blockModels,
  onModelChange,
}) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { isValidConnection } = useConnectionValidation();
  
  // Convert blocks to React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    blocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      data: {
        label: block.type,
        initialData: block.initialData,
        selectedModel: blockModels[block.id],
      },
    })),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Sync blocks to nodes when blocks change
  useEffect(() => {
    setNodes(blocks.map(block => ({
      id: block.id,
      type: block.type,
      position: block.position,
      data: {
        label: block.type,
        initialData: block.initialData,
        selectedModel: blockModels[block.id],
      },
      selected: block.id === selectedBlockId,
    })));
  }, [blocks, blockModels, selectedBlockId]);

  // Sync node positions back to blocks
  useEffect(() => {
    nodes.forEach(node => {
      const block = blocks.find(b => b.id === node.id);
      if (block && (block.position.x !== node.position.x || block.position.y !== node.position.y)) {
        onUpdateBlockPosition(node.id, node.position);
      }
    });
  }, [nodes]);

  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });
  const [activeConnection, setActiveConnection] = useState<any>(null);
  const [showGrid, setShowGrid] = useState(true);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isValidConnection(connection)) {
        setEdges((eds) => addEdge({ ...connection, type: 'studio' }, eds));
      }
    },
    [isValidConnection]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      if (!connectionState.isValid) {
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        setNodeSelectorPosition(position);
        setShowNodeSelector(true);
        setActiveConnection(connectionState);
      }
    },
    [screenToFlowPosition]
  );

  const handleSelectNodeType = useCallback(
    (type: 'text' | 'image' | 'video') => {
      const newBlock: Block = {
        id: uuidv4(),
        type,
        position: nodeSelectorPosition,
      };

      onAddBlock(newBlock);

      // If there's an active connection, create the edge
      if (activeConnection) {
        setTimeout(() => {
          setEdges((eds) =>
            addEdge(
              {
                id: uuidv4(),
                source: activeConnection.fromNode.id,
                target: newBlock.id,
                type: 'studio',
              },
              eds
            )
          );
        }, 100);
      }

      setShowNodeSelector(false);
      setActiveConnection(null);
    },
    [nodeSelectorPosition, activeConnection, onAddBlock]
  );

  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setNodeSelectorPosition(position);
      setShowNodeSelector(true);
    },
    [screenToFlowPosition]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onSelectBlock(node.id);
    },
    [onSelectBlock]
  );

  const handlePaneClick = useCallback(() => {
    setShowNodeSelector(false);
    onSelectBlock('');
  }, [onSelectBlock]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Close node selector or deselect
      if (e.key === 'Escape') {
        setShowNodeSelector(false);
        setActiveConnection(null);
        onSelectBlock('');
      }

      // Delete: Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        const selectedNode = nodes.find(n => n.id === selectedBlockId);
        if (selectedNode && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onDeleteBlock(selectedBlockId);
        }
      }

      // Cmd/Ctrl + D: Duplicate selected node
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        const selectedNode = nodes.find(n => n.id === selectedBlockId);
        if (selectedNode) {
          const newBlock: Block = {
            id: uuidv4(),
            type: selectedNode.type as 'text' | 'image' | 'video',
            position: {
              x: selectedNode.position.x + 50,
              y: selectedNode.position.y + 50,
            },
            initialData: (selectedNode.data as any)?.initialData,
          };
          onAddBlock(newBlock);
        }
      }

      // Cmd/Ctrl + 0: Fit view
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
      }

      // G: Toggle grid
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, selectedBlockId, onDeleteBlock, onAddBlock, fitView, onSelectBlock]);

  // Fit view on initial mount
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Node Selector */}
      <AnimatePresence>
        {showNodeSelector && (
          <div
            style={{
              position: 'fixed',
              left: nodeSelectorPosition.x,
              top: nodeSelectorPosition.y,
              zIndex: 1000,
            }}
          >
            <ConnectionNodeSelector
              position={nodeSelectorPosition}
              onSelectType={handleSelectNodeType}
              onNavigate={() => {}}
              onCancel={() => {
                setShowNodeSelector(false);
                setActiveConnection(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDoubleClick={handleCanvasDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={CustomConnectionLine}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={30}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={null}
        className="bg-black"
      >
        {showGrid && (
          <Background
            color="hsl(var(--border))"
            gap={20}
            variant={BackgroundVariant.Dots}
          />
        )}
        <Controls
          showInteractive={false}
          className="bg-zinc-900 border-zinc-800"
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'text') return 'hsl(var(--chart-1))';
            if (node.type === 'image') return 'hsl(var(--chart-2))';
            if (node.type === 'video') return 'hsl(var(--chart-3))';
            return 'hsl(var(--muted))';
          }}
          className="bg-zinc-900 border-zinc-800"
        />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <EmptyCanvasState onAddBlock={(type) => onAddBlock({ id: uuidv4(), type, position: { x: 400, y: 300 } })} />
        </div>
      )}

      {/* Grid toggle indicator */}
      {!showGrid && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-zinc-400 backdrop-blur-sm">
          Grid hidden (press G to show)
        </div>
      )}
    </div>
  );
};

const StudioCanvas: React.FC<StudioCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <StudioCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default StudioCanvas;
