import { useCallback, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
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

        {/* Info Panel */}
        <Panel position="top-right" className="space-y-2">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card/90 backdrop-blur border border-border rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>{nodes.length} nodes • {edges.length} connections</span>
            </div>
          </motion.div>
        </Panel>

        {/* Keyboard Shortcuts Help */}
        <Panel position="bottom-left" className="bg-card/90 backdrop-blur border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <div><kbd className="px-1 py-0.5 bg-muted rounded text-foreground">Delete</kbd> Remove selected</div>
            <div><kbd className="px-1 py-0.5 bg-muted rounded text-foreground">Shift</kbd> Multi-select</div>
            <div><kbd className="px-1 py-0.5 bg-muted rounded text-foreground">Space</kbd> + Drag Pan canvas</div>
          </div>
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
