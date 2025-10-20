import { useCallback, useEffect, useState, useRef } from 'react';
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
  OnSelectionChangeParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Zap, History, Keyboard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EnhancedNode from './nodes/EnhancedNode';
import EnhancedEdge from './edges/EnhancedEdge';
import { ContextMenu } from './ContextMenu';
import { SimplifiedSidebar } from './SimplifiedSidebar';
import { ResultsGallery } from './ResultsGallery';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { supabaseService } from '@/services/supabaseService';
import { useParams } from 'react-router-dom';
import { ConnectionValidator } from '@/lib/validation/connectionValidator';
import { GraphExecutor } from '@/lib/execution/graphExecutor';
import { useRealtimeExecution } from '@/hooks/useRealtimeExecution';

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
    status?: 'idle' | 'queued' | 'generating' | 'complete' | 'error';
    progress?: number;
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

// Node types configuration - Defined outside component to prevent recreation
const nodeTypes: NodeTypes = {
  text: EnhancedNode,
  image: EnhancedNode,
  video: EnhancedNode,
};

// Edge types configuration - Defined outside component to prevent recreation
const edgeTypes: EdgeTypes = {
  custom: EnhancedEdge,
};

// Connection line style - Defined outside component
const connectionLineStyle = {
  stroke: '#6366F1',
  strokeWidth: 2.5,
  strokeDasharray: '8 4',
};

// Default edge options - Defined outside component
const defaultEdgeOptions = {
  type: 'custom',
  animated: true,
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
  const { projectId } = useParams<{ projectId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    blocks.map(block => blockToNode(block, blockModels))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: Node } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { fitView, getNodes, getEdges } = useReactFlow();
  const { takeSnapshot, undo, redo } = useUndoRedo(nodes, edges);
  const validator = useRef(new ConnectionValidator()).current;
  const executor = useRef(new GraphExecutor()).current;

  // Use realtime execution hook
  const { resetNodeStatuses } = useRealtimeExecution(
    currentRunId,
    () => {
      setIsExecuting(false);
      setCurrentRunId(null);
      const currentNodes = getNodes();
      setNodes(currentNodes.map(node => {
        if (node.data.outputs?.['image-out']?.url) {
          return {
            ...node,
            data: {
              ...node.data,
              imageUrl: node.data.outputs['image-out'].url,
            },
          };
        }
        return node;
      }));
    },
    () => {
      setIsExecuting(false);
      setCurrentRunId(null);
    }
  );

  // Load blocks and connections from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const loadedBlocks = await supabaseService.studioBlocks.listByProject(projectId);
        const flowNodes = loadedBlocks.map((block): Node => ({
          id: block.id,
          type: block.block_type,
          position: { x: Number(block.position_x), y: Number(block.position_y) },
          data: {
            type: block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1),
            label: block.prompt || 'Enter your prompt...',
            model: block.selected_model || 'GPT-5',
            imageUrl: block.generated_output_url,
          },
        }));
        setNodes(flowNodes);

        const loadedConnections = await supabaseService.studioConnections.listByProject(projectId);
        const flowEdges = loadedConnections.map((conn): Edge => ({
          id: conn.id,
          source: conn.source_block_id,
          target: conn.target_block_id,
          sourceHandle: conn.source_handle,
          targetHandle: conn.target_handle,
          type: 'custom',
          animated: conn.animated ?? true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'hsl(var(--primary))',
          },
        }));
        setEdges(flowEdges);

        toast({ title: 'Project loaded' });
      } catch (error) {
        console.error('Error loading studio data:', error);
        toast({ title: 'Error loading project', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, setNodes, setEdges]);

  // Handle new connections with validation
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const validation = validator.validateConnection(
        sourceNode,
        targetNode,
        params.sourceHandle,
        params.targetHandle,
        edges
      );

      if (!validation.valid) {
        toast({ title: 'Invalid Connection', description: validation.reason, variant: 'destructive' });
        return;
      }

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
      
      takeSnapshot(nodes, edges);
    },
    [setEdges, nodes, edges, validator, takeSnapshot]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectBlock(node.id);
    },
    [onSelectBlock]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onUpdateBlockPosition(node.id, node.position);
    },
    [onUpdateBlockPosition]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => onDeleteBlock(node.id));
      toast({ title: `${deleted.length} node(s) deleted` });
    },
    [onDeleteBlock]
  );

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
          status: 'idle',
        },
      };

      onAddBlock(newBlock);
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} node added` });
    },
    [onAddBlock]
  );

  const handleSave = useCallback(async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      const existingBlocks = await supabaseService.studioBlocks.listByProject(projectId);
      const existingConnections = await supabaseService.studioConnections.listByProject(projectId);
      
      await Promise.all([
        ...existingBlocks.map(block => supabaseService.studioBlocks.delete(block.id)),
        ...existingConnections.map(conn => supabaseService.studioConnections.delete(conn.id)),
      ]);

      for (const node of currentNodes) {
        await supabaseService.studioBlocks.create({
          project_id: projectId,
          block_type: node.type as 'text' | 'image' | 'video',
          position_x: node.position.x,
          position_y: node.position.y,
          prompt: node.data.label,
          selected_model: node.data.model,
          generated_output_url: node.data.imageUrl,
          generation_metadata: node.data,
        });
      }

      for (const edge of currentEdges) {
        await supabaseService.studioConnections.create({
          project_id: projectId,
          source_block_id: edge.source,
          target_block_id: edge.target,
          source_handle: edge.sourceHandle || undefined,
          target_handle: edge.targetHandle || undefined,
          animated: edge.animated,
        });
      }

      toast({ title: 'Project saved' });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, getNodes, getEdges]);

  const handleRunWorkflow = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsExecuting(true);

      const validation = validator.validateGraph(nodes, edges);
      if (!validation.valid) {
        toast({
          title: 'Cannot Run Workflow',
          description: `Issues: ${validation.errors.slice(0, 3).join(', ')}`,
          variant: 'destructive',
        });
        setIsExecuting(false);
        return;
      }

      resetNodeStatuses();
      const result = await executor.executeGraph(nodes, edges, projectId);
      setCurrentRunId(result.runId);

      toast({ title: 'Workflow Started', description: `Executing ${nodes.length} nodes` });

    } catch (error) {
      console.error('Execution error:', error);
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setIsExecuting(false);
    }
  }, [projectId, nodes, edges, validator, executor, resetNodeStatuses]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#0F0F10] flex items-center justify-center">
        <Zap className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex relative" style={{ background: '#0F0F10' }}>
      {/* Left Sidebar */}
      <SimplifiedSidebar
        onAddBlock={addNode}
        onRunWorkflow={handleRunWorkflow}
        credits={92}
      />

      {/* Main Canvas */}
      <div className="flex-1 ml-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineStyle={connectionLineStyle}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2.5}
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="#27272A"
            gap={32}
            size={1}
            style={{ background: '#0F0F10' }}
          />

          <Controls className="!bg-[#141416] !border-[#3F3F46] !rounded-xl" showInteractive={false} />
          <MiniMap className="!bg-[#141416] !border-[#3F3F46] !rounded-xl" maskColor="rgba(20, 20, 22, 0.6)" nodeBorderRadius={12} />

          {/* Workflow Label */}
          <Panel position="top-left" className="!m-0 !p-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1.5 rounded-lg bg-[#1C1C1F] border border-[#3F3F46] shadow-lg"
            >
              <span className="text-sm font-medium text-[#FAFAFA]">360 Fashion Workflow</span>
            </motion.div>
          </Panel>

          {/* Top Toolbar */}
          <Panel position="top-right" className="!m-0 !p-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => fitView({ padding: 0.3, duration: 300 })}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#3F3F46] hover:border-[#6366F1] bg-[#1C1C1F] text-[#A1A1AA] hover:text-[#FAFAFA]"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#3F3F46] hover:border-[#6366F1] bg-[#1C1C1F] text-[#A1A1AA] hover:text-[#FAFAFA]"
              >
                <Save className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-[#3F3F46] hover:border-[#6366F1] bg-[#1C1C1F] text-[#A1A1AA] hover:text-[#FAFAFA]">
                <History className="w-5 h-5" />
              </button>
            </motion.div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Results Gallery */}
      <ResultsGallery
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
};

export const StudioCanvas = (props: StudioCanvasProps) => (
  <ReactFlowProvider>
    <StudioCanvasInner {...props} />
  </ReactFlowProvider>
);

export default StudioCanvas;
