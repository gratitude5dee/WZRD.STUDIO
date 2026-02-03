import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { ImprovedEdge } from './edges/ImprovedEdge';
import { BezierConnection } from './connections/BezierConnection';
import { CustomConnectionLine } from './ConnectionLine';
import { ConnectionNodeSelector } from './ConnectionNodeSelector';
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ConnectionModeIndicator } from './canvas/ConnectionModeIndicator';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';
import { QueueIndicator } from './QueueIndicator';
import { StudioGalleryPanel } from './StudioGalleryPanel';

import { useConnectionValidation } from '@/hooks/useConnectionValidation';
import { useStrictConnectionValidation } from '@/hooks/useStrictConnectionValidation';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useStudioKeyboardShortcuts } from '@/hooks/studio/useStudioKeyboardShortcuts';
import { useSelectionBox } from '@/hooks/studio/useSelectionBox';
import { useNodePositionSync } from '@/hooks/studio/useNodePositionSync';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { HANDLE_COLORS, DataType, NodeDefinition } from '@/types/computeFlow';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { v4 as uuidv4 } from 'uuid';
import EmptyCanvasState from './EmptyCanvasState';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { AddBlockNode } from './nodes/AddBlockNode';
import { StudioErrorBoundary } from './StudioErrorBoundary';
import { SelectionNode } from './nodes/SelectionNode';

// New upload nodes
import { UploadImageNode } from './nodes/UploadImageNode';
import { UploadVideoNode } from './nodes/UploadVideoNode';
import { UploadAudioNode } from './nodes/UploadAudioNode';
import { UploadDocumentNode } from './nodes/UploadDocumentNode';
import { Upload3DNode } from './nodes/Upload3DNode';

// New generation nodes
import { ReactFlowAudioNode } from './nodes/ReactFlowAudioNode';
import { ReactFlow3DNode } from './nodes/ReactFlow3DNode';
import CommentNode from './nodes/CommentNode';

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
  interactionMode?: 'pan' | 'select';
  onToggleInteractionMode?: () => void;
  onWorkflowGenerated?: (nodes: any[], edges: any[]) => void;
  initialViewport?: { x: number; y: number; zoom: number };
  initialSettings?: { showGrid?: boolean };
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
  onCanvasSettingsChange?: (settings: { showGrid?: boolean }) => void;
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
  selectionNode: SelectionNode,
  
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

  // Comment node
  comment: CommentNode,
};

// Edge types configuration
const edgeTypes: EdgeTypes = {
  bezier: BezierConnection,
  studio: GlowingEdge,
  glow: GlowingEdge,
  compute: ComputeEdge,
  improved: ImprovedEdge,
  default: BezierConnection,
};

// Default edge options
const defaultEdgeOptions = {
  type: 'improved',
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
  interactionMode = 'pan',
  onToggleInteractionMode,
  onWorkflowGenerated,
  initialViewport,
  initialSettings,
  onViewportChange,
  onCanvasSettingsChange,
}) => {
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, setViewport } = useReactFlow();
  const { isValidConnection: isValidBlockConnection } = useConnectionValidation();
  const { validateNewEdge } = useStrictConnectionValidation();
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
  
  // Gallery closed by default for clean start
  const [showGallery, setShowGallery] = useState(false);

  const [showGrid, setShowGrid] = useState(initialSettings?.showGrid ?? true);
  const lastViewportRef = useRef<string | null>(null);
  const appliedViewportRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof initialSettings?.showGrid === 'boolean') {
      setShowGrid(initialSettings.showGrid);
    }
  }, [initialSettings?.showGrid]);

  useEffect(() => {
    if (!initialViewport) return;
    const nextKey = JSON.stringify(initialViewport);
    if (appliedViewportRef.current === nextKey) return;
    appliedViewportRef.current = nextKey;
    setViewport(initialViewport, { duration: 0 });
  }, [initialViewport, setViewport]);
  
  // Track dragging data type for handle highlighting
  const [draggingDataType, setDraggingDataType] = useState<DataType | null>(null);
  
  const isDebug = import.meta.env?.DEV ?? false;

  // Handler for spawning multiple blocks
  const handleSpawnBlocks = useCallback((spawnedBlocks: Array<Block>) => {
    if (isDebug) {
      console.log('📦 StudioCanvas: Spawning blocks', spawnedBlocks);
    }
    spawnedBlocks.forEach((block) => {
      if (isDebug) {
        console.log('➕ Adding block:', block.id, block.position);
      }
      onAddBlock(block);
    });
  }, [onAddBlock, isDebug]);

  const handleDuplicateBlock = useCallback((block: Block) => {
    const newBlock: Block = {
      ...block,
      id: uuidv4(),
      position: {
        x: block.position.x + 40,
        y: block.position.y + 40,
      },
    };
    onAddBlock(newBlock);
  }, [onAddBlock]);

  const handleDuplicateComputeNode = useCallback((nodeDef: NodeDefinition) => {
    const newId = uuidv4();
    const duplicatedNode: NodeDefinition = {
      ...nodeDef,
      id: newId,
      label: `${nodeDef.label} Copy`,
      position: {
        x: nodeDef.position.x + 40,
        y: nodeDef.position.y + 40,
      },
      status: 'idle',
      progress: 0,
      error: undefined,
      preview: undefined,
      inputs: nodeDef.inputs?.map((input, index) => ({
        ...input,
        id: `${newId}-input-${index}`,
      })) ?? [],
      outputs: nodeDef.outputs?.map((output, index) => ({
        ...output,
        id: `${newId}-output-${index}`,
      })) ?? [],
    };

    addComputeNode(duplicatedNode);
  }, [addComputeNode]);

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
          onModelChange: (modelId: string) => onModelChange(block.id, modelId),
          onDuplicate: () => handleDuplicateBlock(block),
          onDelete: () => onDeleteBlock(block.id),
        },
        draggable: true,
        selectable: true,
        connectable: true,
    })),
    [
      blocks,
      blockModels,
      handleSpawnBlocks,
      handleDuplicateBlock,
      onModelChange,
      onDeleteBlock,
    ]
  );

  const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState([]);
  
  // Track when nodes are being added (to prevent race condition deletions)
  const [isAddingNodes, setIsAddingNodes] = useState(false);
  const prevNodeCount = useRef(nodeDefinitions.length);
  
  // Detect when new nodes are being added and set a brief protection window
  useEffect(() => {
    if (nodeDefinitions.length > prevNodeCount.current) {
      setIsAddingNodes(true);
      // Clear protection after nodes are fully initialized
      const timeout = setTimeout(() => setIsAddingNodes(false), 300);
      return () => clearTimeout(timeout);
    }
    prevNodeCount.current = nodeDefinitions.length;
  }, [nodeDefinitions.length]);
  
  const { onNodeDragStop, onNodeDragStart, filterNodeChanges } = useNodePositionSync({
    useComputeFlow,
    projectId,
    onUpdateBlockPosition,
  });

  useUnsavedChangesWarning();

  // Wrapped onNodesChange to prevent unexpected deletions during node addition
  const onNodesChange = useCallback((changes: any[]) => {
    // Filter out remove events during the protection window
    const safeChanges = isAddingNodes
      ? changes.filter(change => {
          if (change.type === 'remove') {
            console.warn('🛡️ Blocked node removal during add operation:', change.id);
            return false;
          }
          return true;
        })
      : changes;
    
    const filteredChanges = filterNodeChanges(safeChanges);
    onNodesChangeBase(filteredChanges);
  }, [onNodesChangeBase, isAddingNodes, filterNodeChanges]);
  
  // Wrapped onEdgesChange (no special handling needed, just for consistency)
  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeBase(changes);
  }, [onEdgesChangeBase]);
  
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
      'Comment': 'comment',
      'comment': 'comment',
    };
    return kindToType[kind] || 'compute';
  }, []);

  const blockNodes: Node[] = useMemo(() =>
    blocks.map((block) => ({
      id: block.id,
      type: block.type,
      position: block.position,
      data: {
        label: block.type,
        initialData: block.initialData,
        selectedModel: blockModels[block.id],
        blockPosition: block.position,
        onSpawnBlocks: handleSpawnBlocks,
        onModelChange: (modelId: string) => onModelChange(block.id, modelId),
        onDuplicate: () => handleDuplicateBlock(block),
        onDelete: () => onDeleteBlock(block.id),
      },
      selected: block.id === selectedBlockId,
      draggable: true,
      selectable: true,
      connectable: true,
    })),
    [
      blocks,
      blockModels,
      selectedBlockId,
      handleSpawnBlocks,
      handleDuplicateBlock,
      onModelChange,
      onDeleteBlock,
    ]
  );

  const computeNodes: Node[] = useMemo(() => {
    if (!useComputeFlow) return [];

    return nodeDefinitions.map((nodeDef) => ({
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

        // Callbacks - wire up onExecute for per-node generation
        onSpawnBlocks: handleSpawnBlocks,
        onExecute: () => handleNodeExecute(nodeDef.id),
        onGenerate: () => handleNodeExecute(nodeDef.id),
        onDuplicate: () => handleDuplicateComputeNode(nodeDef),
        onDelete: () => removeComputeNode(nodeDef.id),
        onModelChange: (modelId: string) =>
          updateComputeNode(nodeDef.id, {
            params: {
              ...nodeDef.params,
              model: modelId,
            },
          }),
      },
      draggable: true,
      selectable: true,
      connectable: true,
    }));
  }, [
    useComputeFlow,
    nodeDefinitions,
    getNodeTypeFromKind,
    handleSpawnBlocks,
    handleNodeExecute,
    handleDuplicateComputeNode,
    removeComputeNode,
    updateComputeNode,
  ]);

  // Consolidated node sync to reduce churn
  useEffect(() => {
    setNodes((currentNodes) => {
      const addBlockNodes = currentNodes.filter((node) => node.type === 'addBlockNode');
      const selectionNodes = currentNodes.filter((node) => node.type === 'selectionNode');
      const nodeMap = new Map<string, Node>();

      computeNodes.forEach((node) => nodeMap.set(node.id, node));
      blockNodes.forEach((node) => {
        if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
      });
      addBlockNodes.forEach((node) => {
        if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
      });
      selectionNodes.forEach((node) => {
        if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
      });

      return Array.from(nodeMap.values());
    });
  }, [blockNodes, computeNodes, setNodes]);

  // Handler for executing individual nodes
  const handleNodeExecute = useCallback((nodeId: string) => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }
    if (isDebug) {
      console.log('🎯 [StudioCanvas] Executing single node:', nodeId);
    }
    // For now, execute the full graph - the backend will handle running only what's needed
    executeGraphStreaming(projectId);
  }, [projectId, executeGraphStreaming, isDebug]);

  // Listen for fitView events from workflow generation
  useEffect(() => {
    const handleFitViewEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeIds: string[]; animate: boolean }>;
      const { animate } = customEvent.detail;
      
      // Slight delay to ensure nodes are fully rendered
      setTimeout(() => {
        fitView({ padding: 0.3, duration: animate ? 400 : 0 });
      }, 50);
    };

    window.addEventListener('fitViewToWorkflow', handleFitViewEvent);
    return () => window.removeEventListener('fitViewToWorkflow', handleFitViewEvent);
  }, [fitView]);

  // Sync edgeDefinitions from compute flow store to React Flow edges
  useEffect(() => {
    if (!useComputeFlow) return;
    
    if (isDebug) {
      console.log('🔗 Syncing edges to React Flow:', edgeDefinitions.length);
    }
    
    const computeEdges: Edge[] = edgeDefinitions.map(edgeDef => {
      // Verify source and target nodes exist
      const sourceNode = nodeDefinitions.find(n => n.id === edgeDef.source.nodeId);
      const targetNode = nodeDefinitions.find(n => n.id === edgeDef.target.nodeId);
      
      if (!sourceNode || !targetNode) {
        if (isDebug) {
          console.warn('⚠️ Edge references missing node:', {
            edgeId: edgeDef.id,
            sourceNodeId: edgeDef.source.nodeId,
            targetNodeId: edgeDef.target.nodeId,
            sourceExists: !!sourceNode,
            targetExists: !!targetNode,
          });
        }
      }
      
      return {
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
      };
    });
    
    if (isDebug) {
      console.log('✅ Setting React Flow edges:', computeEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })));
    }
    
    setEdges(computeEdges);
  }, [edgeDefinitions, nodeDefinitions, useComputeFlow, setEdges]);

  // Load existing graph on mount when in compute flow mode
  useEffect(() => {
    if (useComputeFlow && projectId) {
      loadGraph(projectId);
    }
  }, [useComputeFlow, projectId, loadGraph]);

  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });
  const [activeConnection, setActiveConnection] = useState<any>(null);
  
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

  const handleMoveEnd = useCallback(
    (_event: any, viewport: { x: number; y: number; zoom: number }) => {
      const nextKey = JSON.stringify(viewport);
      if (lastViewportRef.current === nextKey) return;
      lastViewportRef.current = nextKey;
      onViewportChange?.(viewport);
    },
    [onViewportChange]
  );

  const handleToggleGrid = useCallback(() => {
    setShowGrid((prev) => {
      const next = !prev;
      onCanvasSettingsChange?.({ showGrid: next });
      return next;
    });
  }, [onCanvasSettingsChange]);
  
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

    const validation = validateNewEdge(
      source,
      sourceHandle,
      target,
      targetHandle
    );

    return validation.valid;
  }, [useComputeFlow, isValidBlockConnection, validateNewEdge]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (useComputeFlow) {
        const { source, sourceHandle, target, targetHandle } = connection;
        if (!source || !target) return;

        const validation = validateNewEdge(
          source,
          sourceHandle ?? null,
          target,
          targetHandle ?? null
        );

        if (!validation.valid) {
          toast.error(validation.error || 'Invalid connection');
          return;
        }
      }

      if (isValidConnection(connection)) {
        const { source, sourceHandle } = connection;
        
        // Determine edge type and data
        let edgeType = 'improved';
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
    [isValidConnection, useComputeFlow, nodeDefinitions, projectId, saveGraph, validateNewEdge]
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
    (
      type: 'text' | 'image' | 'video' | 'upload',
      positionOverride?: { x: number; y: number }
    ) => {
      const resolvedPosition = positionOverride ?? nodeSelectorPosition;
      const newBlock: Block = {
        id: uuidv4(),
        type,
        position: resolvedPosition,
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
                type: 'improved',
              },
              eds
            )
          );
        }, 100);
      }

      // Use requestAnimationFrame to defer state clearing and prevent race conditions
      requestAnimationFrame(() => {
        setShowNodeSelector(false);
        setActiveConnection(null);
      });
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
        id: `selection-${nanoid(8)}`,
        type: 'selectionNode',
        position,
        data: {
          showSelector: true,
          onSelectType: handleSelectNodeType,
          onClose: (nodeId: string) => {
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
          },
        },
        draggable: true,
        selectable: true,
        connectable: true,
      };

      setNodeSelectorPosition(position);
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, setNodeSelectorPosition, handleSelectNodeType]
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

  const hasFitViewRef = useRef(false);

  // Fit view once when nodes are ready
  useEffect(() => {
    if (hasFitViewRef.current) return;
    if (nodes.length === 0) return;
    hasFitViewRef.current = true;
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [nodes.length, fitView]);

  return (
    <div className="relative w-full h-full bg-surface-0" data-walkthrough="canvas">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, hsl(var(--text-tertiary)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none" />
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
      <StudioErrorBoundary
        fallbackTitle="Canvas Error"
        fallbackDescription="The studio canvas encountered an error"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeClick={handleNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onMoveEnd={handleMoveEnd}
          onPaneClick={handlePaneClick}
          onDoubleClick={handleCanvasDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={30}
          isValidConnection={isValidConnection}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={null}
          className="bg-transparent"
        >
          {showGrid && (
            <Background
              color="hsl(var(--border-subtle))"
              gap={24}
              variant={BackgroundVariant.Dots}
            />
          )}
        </ReactFlow>
      </StudioErrorBoundary>

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
        onToggleGrid={handleToggleGrid}
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
        interactionMode={interactionMode}
        onToggleInteractionMode={onToggleInteractionMode}
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
          onWorkflowGenerated={onWorkflowGenerated}
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
