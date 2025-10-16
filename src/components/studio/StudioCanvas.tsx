import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionLineType,
  MarkerType,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Zap, Type, Image as ImageIcon, Video, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EnhancedNode from './nodes/EnhancedNode';
import EnhancedEdge from './edges/EnhancedEdge';

export interface Block {
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

// Node types configuration
const nodeTypes: NodeTypes = {
  text: EnhancedNode,
  image: EnhancedNode,
  video: EnhancedNode,
};

// Edge types configuration
const edgeTypes: EdgeTypes = {
  custom: EnhancedEdge,
};

// Convert Block to React Flow Node
const blockToNode = (block: Block, models: Record<string, string>): Node => ({
  id: block.id,
  type: block.type,
  position: block.position,
  data: {
    type: block.type.charAt(0).toUpperCase() + block.type.slice(1),
    label: block.initialData?.prompt || 'Enter your prompt...',
    model: models[block.id] || 'GPT-5',
    imageUrl: block.initialData?.imageUrl,
    ...block.initialData,
  },
  selected: false,
});

const StudioCanvasInner = ({ 
  blocks, 
  selectedBlockId, 
  onSelectBlock, 
  onAddBlock, 
  onDeleteBlock,
  onUpdateBlockPosition,
  blockModels, 
}: StudioCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    blocks.map(block => blockToNode(block, blockModels))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Sync blocks to nodes when blocks change
  useEffect(() => {
    const newNodes = blocks.map(block => blockToNode(block, blockModels));
    setNodes(newNodes);
  }, [blocks, blockModels, setNodes]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'custom',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: 'hsl(var(--primary))',
            },
          },
          eds
        )
      );
      toast.success('Connection created');
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectBlock(node.id);
    },
    [onSelectBlock]
  );

  // Handle node drag end - update block position
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onUpdateBlockPosition(node.id, node.position);
    },
    [onUpdateBlockPosition]
  );

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        onDeleteBlock(node.id);
      });
      toast.success(`${deleted.length} node(s) deleted`);
    },
    [onDeleteBlock]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      toast.success(`${deleted.length} connection(s) deleted`);
    },
    []
  );

  // Add new node at center
  const addNode = useCallback(
    (type: 'text' | 'image' | 'video') => {
      const newBlock: Block = {
        id: `node-${Date.now()}`,
        type,
        position: {
          x: 400 + Math.random() * 200,
          y: 300 + Math.random() * 200,
        },
        initialData: {
          prompt: `New ${type} node`,
        },
      };

      onAddBlock(newBlock);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} node added`);
    },
    [onAddBlock]
  );

  // Save project (placeholder - can be connected to actual save logic)
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Saving project...',
        success: 'Project saved successfully!',
        error: 'Failed to save project',
      }
    );
    setTimeout(() => setIsSaving(false), 1000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Cmd/Ctrl + A: Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
        toast.info('All nodes selected');
      }

      // Cmd/Ctrl + 1/2/3: Add node shortcuts
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const types = { '1': 'text', '2': 'image', '3': 'video' } as const;
        addNode(types[e.key as '1' | '2' | '3']);
      }

      // F: Fit view
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitView({ padding: 0.3, duration: 300 });
        toast.info('View fitted to canvas');
      }

      // +/-: Zoom
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }

      // ?: Show keyboard shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNode, fitView, handleSave, setNodes, zoomIn, zoomOut]);

  return (
    <div className="w-full h-full bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2.5,
          strokeDasharray: '8 4',
        }}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
        fitView
        fitViewOptions={{
          padding: 0.3,
        }}
        minZoom={0.2}
        maxZoom={2.5}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="hsl(var(--border))"
          gap={20}
          size={1}
          className="opacity-30"
        />

        <Controls
          className="!bg-card !border-border !rounded-lg"
          showInteractive={false}
        />

        <MiniMap
          className="!bg-card !border-2 !border-border !rounded-lg"
          maskColor="hsla(var(--background), 0.6)"
          nodeColor={(node) => {
            switch (node.type) {
              case 'video':
                return 'hsl(var(--primary))';
              case 'image':
                return 'hsl(var(--accent))';
              default:
                return 'hsl(var(--secondary))';
            }
          }}
          nodeBorderRadius={12}
        />

        {/* Floating Action Panel - Top Left */}
        <Panel position="top-left" className="space-y-2">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Button
              onClick={() => addNode('text')}
              className="w-full bg-card hover:bg-muted border border-border text-foreground shadow-lg"
              size="sm"
            >
              <Type className="w-4 h-4 mr-2" />
              Text Node
            </Button>
            
            <Button
              onClick={() => addNode('image')}
              className="w-full bg-card hover:bg-muted border border-border text-foreground shadow-lg"
              size="sm"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image Node
            </Button>
            
            <Button
              onClick={() => addNode('video')}
              className="w-full bg-card hover:bg-muted border border-border text-foreground shadow-lg"
              size="sm"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Node
            </Button>
          </motion.div>
        </Panel>

        {/* Stats & Save Panel - Top Right */}
        <Panel position="top-right" className="space-y-2">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span>{nodes.length} nodes • {edges.length} connections</span>
            </div>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </motion.div>
        </Panel>

        {/* Keyboard Shortcuts Help - Bottom Left */}
        <Panel position="bottom-left">
          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h3>
                  </div>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Hide
                  </button>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Add Text Node</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ 1</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Add Image Node</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ 2</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Add Video Node</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ 3</kbd>
                  </div>
                  
                  <div className="border-t border-border my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Save Project</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ S</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Select All</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ A</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delete Selected</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">Del</kbd>
                  </div>
                  
                  <div className="border-t border-border my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fit View</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">F</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Zoom In/Out</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">+/-</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multi-select</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">Shift</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pan Canvas</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">Space</kbd>
                  </div>
                  
                  <div className="border-t border-border my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toggle Shortcuts</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">?</kbd>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!showShortcuts && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowShortcuts(true)}
              className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-2 shadow-lg hover:bg-muted transition-colors"
            >
              <Keyboard className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider
const StudioCanvas = (props: StudioCanvasProps) => (
  <ReactFlowProvider>
    <StudioCanvasInner {...props} />
  </ReactFlowProvider>
);

export default StudioCanvas;
