import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Maximize, Grid3x3 } from 'lucide-react';
import {
  ReactFlow,
  Background,
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
import { ReactFlowUploadNode } from './nodes/ReactFlowUploadNode';
import { ComputeNode } from './nodes/ComputeNode';
import { GlowingEdge } from './edges/GlowingEdge';
import { ComputeEdge } from './edges/ComputeEdge';
import { BezierConnection } from './connections/BezierConnection';
import { CustomConnectionLine } from './ConnectionLine';
import { ConnectionNodeSelector } from './ConnectionNodeSelector';
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ConnectionModeIndicator } from './canvas/ConnectionModeIndicator';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';
import { QueueIndicator } from './QueueIndicator';
import { StudioGalleryPanel } from './StudioGalleryPanel';
import { useConnectionValidation } from '@/hooks/useConnectionValidation';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useStudioKeyboardShortcuts } from '@/hooks/studio/useStudioKeyboardShortcuts';
import { useSelectionBox } from '@/hooks/studio/useSelectionBox';
import { HANDLE_COLORS, DataType, ConnectionValidator, isTypeCompatible } from '@/types/computeFlow';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { v4 as uuidv4 } from 'uuid';
import EmptyCanvasState from './EmptyCanvasState';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { AddBlockNode } from './nodes/AddBlockNode';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

// New upload nodes
import { UploadImageNode } from './nodes/UploadImageNode';
import { UploadVideoNode } from './nodes/UploadVideoNode';
import { UploadAudioNode } from './nodes/UploadAudioNode';
import { UploadDocumentNode } from './nodes/UploadDocumentNode';
import { Upload3DNode } from './nodes/Upload3DNode';

// New generation nodes
import { ReactFlowAudioNode } from './nodes/ReactFlowAudioNode';
import { ReactFlow3DNode } from './nodes/ReactFlow3DNode';

// Output node
import { OutputNode } from './nodes/OutputNode';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'upload';
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
  projectId?: string;
  useComputeFlow?: boolean;
}

// Node types configuration (outside component for React Flow optimization)
const nodeTypes: NodeTypes = {
  // Core nodes
  text: ReactFlowTextNode,
  image: ReactFlowImageNode,
  video: ReactFlowVideoNode,
  upload: ReactFlowUploadNode,
  compute: ComputeNode,
  addBlockNode: AddBlockNode,
  
  // Specialized upload nodes
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  uploadAudio: UploadAudioNode,
  uploadDocument: UploadDocumentNode,
  upload3D: Upload3DNode,
  
  // Generation nodes
  audio: ReactFlowAudioNode,
  '3d': ReactFlow3DNode,
  
  // Output node
  output: OutputNode,
};

// Edge types configuration
const edgeTypes: EdgeTypes = {
  bezier: BezierConnection,
  studio: GlowingEdge,
  glow: GlowingEdge,
  compute: ComputeEdge,
  default: BezierConnection,
};

// Default edge options
const defaultEdgeOptions = {
  type: 'glow',
  animated: false,
  data: {
    status: 'idle',
    dataType: 'data',
  },
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
  projectId,
  useComputeFlow = false,
}) => {
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, getEdges } = useReactFlow();
  const { isValidConnection: isValidBlockConnection } = useConnectionValidation();
  const { 
    connectionState, 
    isClickMode, 
    isConnecting,
    toggleMode,
    cancelClickConnection 
  } = useConnectionMode();
  
  // Compute flow store
  const { 
    nodeDefinitions, 
    edgeDefinitions, 
    loadGraph, 
    saveGraph,
    addNode: addComputeNode,
    updateNode: updateComputeNode,
    removeNode: removeComputeNode,
    executeGraphStreaming,
    cancelExecution,
    execution,
    isSaving,
    addGeneratedWorkflow,
  } = useComputeFlowStore();
  
  // Gallery open by default
  const [showGallery, setShowGallery] = useState(true);
  
  // Track dragging data type for handle highlighting
  const [draggingDataType, setDraggingDataType] = useState<DataType | null>(null);
  
  // Handler for spawning multiple blocks
  const handleSpawnBlocks = useCallback((spawnedBlocks: Array<Block>) => {
    console.log('📦 StudioCanvas: Spawning blocks', spawnedBlocks);
    spawnedBlocks.forEach((block) => {
      console.log('➕ Adding block:', block.id, block.position);
      onAddBlock(block);
    });
  }, [onAddBlock]);

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
        blockPosition: block.position,
        onSpawnBlocks: handleSpawnBlocks,
      },
    })),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Sync blocks to nodes when blocks change
  useEffect(() => {
    setNodes((currentNodes) => {
      const addBlockNodes = currentNodes.filter((node) => node.type === 'addBlockNode');
      const blockNodes = blocks.map((block) => ({
        id: block.id,
        type: block.type,
        position: block.position,
        data: {
          label: block.type,
          initialData: block.initialData,
          selectedModel: blockModels[block.id],
          blockPosition: block.position,
          onSpawnBlocks: handleSpawnBlocks,
        },
        selected: block.id === selectedBlockId,
      }));

      return [...blockNodes, ...addBlockNodes];
    });
  }, [blocks, blockModels, selectedBlockId, handleSpawnBlocks]);

  // Helper to map node kind to React Flow node type
  const getNodeTypeFromKind = useCallback((kind: string): string => {
    const kindToType: Record<string, string> = {
      // Legacy/existing mappings (snake_case)
      'upload': 'upload',
      'upload_image': 'uploadImage',
      'upload_video': 'uploadVideo',
      'upload_audio': 'uploadAudio',
      'upload_document': 'uploadDocument',
      'upload_3d': 'upload3D',
      'text_to_image': 'image',
      'text_to_video': 'video',
      'text_to_text': 'text',
      'image_to_video': 'video',
      'audio_generate': 'audio',
      '3d_generate': '3d',
      'output': 'output',
      
      // AI-generated workflow kinds (capitalized from generate-workflow)
      'Text': 'text',
      'Image': 'image',
      'Video': 'video',
      'Prompt': 'text',
      'Model': 'compute',
      'Transform': 'compute',
      'Output': 'output',
      'Gateway': 'compute',
    };
    return kindToType[kind] || 'compute';
  }, []);

  // Sync nodeDefinitions from compute flow store to React Flow nodes
  useEffect(() => {
    if (!useComputeFlow) return;
    
    const computeNodes: Node[] = nodeDefinitions.map(nodeDef => ({
      id: nodeDef.id,
      type: getNodeTypeFromKind(nodeDef.kind),
      position: nodeDef.position,
      data: {
        // Core compute flow data
        nodeDefinition: nodeDef,
        label: nodeDef.label,
        kind: nodeDef.kind,
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
        params: nodeDef.params,
        status: nodeDef.status || 'idle',
        progress: nodeDef.progress || 0,
        preview: nodeDef.preview,
        error: nodeDef.error,
        
        // For specialized nodes (ImageBlock, VideoBlock, TextBlock)
        selectedModel: nodeDef.params?.model || nodeDef.metadata?.model,
        initialData: nodeDef.params,
        blockPosition: nodeDef.position,
        
        // Callbacks
        onSpawnBlocks: handleSpawnBlocks,
      },
    }));
    
    setNodes(currentNodes => {
      // Keep addBlockNodes
      const addBlockNodes = currentNodes.filter(n => n.type === 'addBlockNode');
      // Keep legacy block nodes that aren't in compute flow
      const blockNodes = currentNodes.filter(n => 
        n.type !== 'addBlockNode' && 
        !nodeDefinitions.some(nd => nd.id === n.id)
      );
      
      return [...computeNodes, ...blockNodes, ...addBlockNodes];
    });
  }, [nodeDefinitions, useComputeFlow, getNodeTypeFromKind, handleSpawnBlocks, setNodes]);

  // Sync edgeDefinitions from compute flow store to React Flow edges
  useEffect(() => {
    if (!useComputeFlow) return;
    
    const computeEdges: Edge[] = edgeDefinitions.map(edgeDef => ({
      id: edgeDef.id,
      source: edgeDef.source.nodeId,
      target: edgeDef.target.nodeId,
      sourceHandle: edgeDef.source.portId,
      targetHandle: edgeDef.target.portId,
      type: 'compute',
      data: {
        dataType: edgeDef.dataType,
        status: edgeDef.status,
      },
      style: {
        stroke: HANDLE_COLORS[edgeDef.dataType as DataType] || HANDLE_COLORS.any,
        strokeWidth: 2,
      },
    }));
    
    setEdges(computeEdges);
  }, [edgeDefinitions, useComputeFlow, setEdges]);

  // Load existing graph on mount when in compute flow mode
  useEffect(() => {
    if (useComputeFlow && projectId) {
      loadGraph(projectId);
    }
  }, [useComputeFlow, projectId, loadGraph]);

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
  
  // Get selected nodes count
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const selectedCount = selectedNodes.length;
  
  // Selection box for multi-select
  const {
    selectionBox,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    getSelectionBoxStyles,
  } = useSelectionBox({
    onSelectionChange: (nodeIds) => {
      if (nodeIds.length === 1) {
        onSelectBlock(nodeIds[0]);
      }
    },
  });
  
  // Integrated keyboard shortcuts
  useStudioKeyboardShortcuts({
    onAddTextNode: () => {
      const newBlock: Block = {
        id: uuidv4(),
        type: 'text',
        position: { x: 400, y: 300 },
      };
      onAddBlock(newBlock);
    },
    onAddImageNode: () => {
      const newBlock: Block = {
        id: uuidv4(),
        type: 'image',
        position: { x: 400, y: 300 },
      };
      onAddBlock(newBlock);
    },
    onAddVideoNode: () => {
      const newBlock: Block = {
        id: uuidv4(),
        type: 'video',
        position: { x: 400, y: 300 },
      };
      onAddBlock(newBlock);
    },
    onDelete: (nodeIds) => {
      nodeIds.forEach(id => onDeleteBlock(id));
    },
    onDuplicate: (nodeIds) => {
      const nodesToDuplicate = nodes.filter(n => nodeIds.includes(n.id));
      nodesToDuplicate.forEach(node => {
        const newBlock: Block = {
          id: uuidv4(),
          type: node.type as 'text' | 'image' | 'video' | 'upload',
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          initialData: (node.data as any)?.initialData,
        };
        onAddBlock(newBlock);
      });
    },
    selectedNodeIds: selectedNodes.map(n => n.id),
  });

  // Enhanced connection validation for compute flow
  const isValidConnection = useCallback((connection: Connection): boolean => {
    // Use legacy validation for non-compute flow
    if (!useComputeFlow) {
      return isValidBlockConnection(connection);
    }
    
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target || !sourceHandle || !targetHandle) return false;

    // Prevent self-connections
    if (source === target) {
      toast.error('Cannot connect node to itself');
      return false;
    }

    const sourceNode = nodeDefinitions.find(n => n.id === source);
    const targetNode = nodeDefinitions.find(n => n.id === target);
    if (!sourceNode || !targetNode) return isValidBlockConnection(connection);

    const sourcePort = sourceNode.outputs.find(p => p.id === sourceHandle);
    const targetPort = targetNode.inputs.find(p => p.id === targetHandle);
    if (!sourcePort || !targetPort) return isValidBlockConnection(connection);

    // Validate using ConnectionValidator
    const validation = ConnectionValidator.validateConnection(
      sourcePort,
      targetPort,
      edgeDefinitions,
      source,
      target
    );

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid connection');
      return false;
    }

    return true;
  }, [useComputeFlow, isValidBlockConnection, nodeDefinitions, edgeDefinitions]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isValidConnection(connection)) {
        const { source, sourceHandle } = connection;
        
        // Determine edge type and data
        let edgeType = 'studio';
        let edgeData: any = { status: 'idle', dataType: 'data' };
        
        if (useComputeFlow && source && sourceHandle) {
          const sourceNode = nodeDefinitions.find(n => n.id === source);
          const sourcePort = sourceNode?.outputs.find(p => p.id === sourceHandle);
          if (sourcePort) {
            edgeType = 'compute';
            edgeData = {
              dataType: sourcePort.datatype,
              status: 'idle',
            };
          }
        }
        
        setEdges((eds) => addEdge({ 
          ...connection, 
          id: uuidv4(),
          type: edgeType,
          data: edgeData,
          style: useComputeFlow && edgeData.dataType ? {
            stroke: HANDLE_COLORS[edgeData.dataType as DataType],
            strokeWidth: 2,
          } : undefined,
        }, eds));
        
        // Auto-save for compute flow
        if (useComputeFlow && projectId) {
          setTimeout(() => saveGraph(projectId), 100);
        }
      }
    },
    [isValidConnection, useComputeFlow, nodeDefinitions, projectId, saveGraph]
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
    (type: 'text' | 'image' | 'video' | 'upload') => {
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
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) {
        return;
      }

      setShowNodeSelector(false);
      setActiveConnection(null);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `add-block-${nanoid(8)}`,
        type: 'addBlockNode',
        position,
        data: {
          label: 'Add Block',
          isNew: true,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('openBlockSelector', {
            detail: { nodeId: newNode.id, position },
          })
        );
      }, 100);
    },
    [screenToFlowPosition, setNodes]
  );

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { nodeId, blockType } = event.detail as { nodeId: string; blockType: Block['type'] };
      const targetNode = nodes.find((node) => node.id === nodeId);
      if (!targetNode) return;

      const newBlock: Block = {
        id: uuidv4(),
        type: blockType,
        position: targetNode.position,
      };

      onAddBlock(newBlock);
      onSelectBlock(newBlock.id);
      setNodes((current) => current.filter((node) => node.id !== nodeId));
    };

    window.addEventListener('transformNode', handler as EventListener);
    return () => window.removeEventListener('transformNode', handler as EventListener);
  }, [nodes, onAddBlock, onSelectBlock, setNodes]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onSelectBlock(node.id);
    },
    [onSelectBlock]
  );

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    setShowNodeSelector(false);
    onSelectBlock('');
    
    // Start selection box if not clicking on a node
    const target = event.target as HTMLElement;
    if (!target.closest('.react-flow__node')) {
      // Cast to the correct type for the hook
      startSelection(event as React.MouseEvent<HTMLDivElement>);
    }
  }, [onSelectBlock, startSelection]);
  
  // Additional keyboard shortcuts (grid, connection mode, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Close node selector or cancel connection
      if (e.key === 'Escape') {
        setShowNodeSelector(false);
        setActiveConnection(null);
        cancelClickConnection();
      }

      // Cmd/Ctrl + 0 or F: Fit view
      if ((e.metaKey || e.ctrlKey) && e.key === '0' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
      }

      // G: Toggle grid
      if (e.key === 'g' || e.key === 'G') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setShowGrid(prev => !prev);
        }
      }

      // C: Toggle connection mode
      if (e.key === 'c' || e.key === 'C') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          toggleMode();
        }
      }

      // +: Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      }

      // -: Zoom out
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fitView, toggleMode, cancelClickConnection, zoomIn, zoomOut]);

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
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <EmptyCanvasState 
            onAddBlock={(type) => onAddBlock({ id: uuidv4(), type, position: { x: 400, y: 300 } })} 
            onExploreFlows={() => setShowGallery(true)}
          />
        </div>
      )}
      
      {/* Selection Box */}
      {selectionBox && (
        <div
          style={getSelectionBoxStyles() || undefined}
          className="transition-all duration-75"
        />
      )}

      {/* Connection Mode Indicator */}
      <ConnectionModeIndicator
        isClickMode={isClickMode}
        isConnecting={isConnecting}
        sourceNodeLabel={connectionState.sourceNode ? `Node ${connectionState.sourceNode.slice(0, 8)}` : undefined}
        onCancel={cancelClickConnection}
      />

      {/* Canvas Toolbar */}
      <CanvasToolbar
        connectionMode={isClickMode ? 'click' : 'drag'}
        onToggleConnectionMode={toggleMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(prev => !prev)}
        onFitView={() => fitView({ padding: 0.2, duration: 300 })}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        selectedCount={selectedCount}
        onDeleteSelected={() => selectedNodes.forEach(node => onDeleteBlock(node.id))}
        onDuplicateSelected={() => {
          selectedNodes.forEach(node => {
            const newBlock: Block = {
              id: uuidv4(),
              type: node.type as 'text' | 'image' | 'video' | 'upload',
              position: {
                x: node.position.x + 50,
                y: node.position.y + 50,
              },
              initialData: (node.data as any)?.initialData,
            };
            onAddBlock(newBlock);
          });
        }}
        // Execution props
        isExecuting={execution.isRunning}
        executionProgress={execution}
        onExecute={useComputeFlow && projectId ? () => executeGraphStreaming(projectId) : undefined}
        onCancelExecution={cancelExecution}
        onSave={useComputeFlow && projectId ? () => saveGraph(projectId) : undefined}
        isSaving={isSaving}
      />
      
      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay />
      
      {/* Queue Indicator - Bottom right */}
      {useComputeFlow && <QueueIndicator />}
      
      {/* Gallery Panel - Right side */}
      {useComputeFlow && (
        <StudioGalleryPanel
          isOpen={showGallery}
          onToggle={() => setShowGallery(prev => !prev)}
          onAddToCanvas={(item) => {
            const newBlock: Block = {
              id: uuidv4(),
              type: item.type === 'image' ? 'image' : item.type === 'video' ? 'video' : 'text',
              position: { x: 400, y: 300 },
              initialData: {
                imageUrl: item.url,
                prompt: item.nodeLabel,
              },
            };
            onAddBlock(newBlock);
            toast.success('Added to canvas');
          }}
          onWorkflowGenerated={(nodes, edges) => {
            addGeneratedWorkflow(nodes as NodeDefinition[], edges as EdgeDefinition[]);
            if (projectId) {
              setTimeout(() => saveGraph(projectId), 500);
            }
          }}
        />
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
