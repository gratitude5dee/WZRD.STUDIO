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
import { Plus, Save, Zap, Type, Image as ImageIcon, Video, Keyboard, Undo, Redo, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import EnhancedNode from './nodes/EnhancedNode';
import EnhancedEdge from './edges/EnhancedEdge';
import { ContextMenu } from './ContextMenu';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { supabaseService } from '@/services/supabaseService';
import { useParams } from 'react-router-dom';

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
  const { projectId } = useParams<{ projectId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    blocks.map(block => blockToNode(block, blockModels))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: Node } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fitView, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(nodes, edges);
  const rfRef = useRef<HTMLDivElement>(null);

  // Load blocks and connections from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        
        // Load blocks
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

        // Load connections
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

        toast({ title: 'Project loaded', description: 'Your canvas has been restored' });
      } catch (error) {
        console.error('Error loading studio data:', error);
        toast({ title: 'Error loading project', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, setNodes, setEdges]);

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
      toast({ title: 'Connection created' });
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
      toast({ title: `${deleted.length} node(s) deleted` });
    },
    [onDeleteBlock]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      toast({ title: `${deleted.length} connection(s) deleted` });
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
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} node added` });
    },
    [onAddBlock]
  );

  // Save project to Supabase
  const handleSave = useCallback(async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      // Delete all existing blocks and connections for this project
      const existingBlocks = await supabaseService.studioBlocks.listByProject(projectId);
      const existingConnections = await supabaseService.studioConnections.listByProject(projectId);
      
      await Promise.all([
        ...existingBlocks.map(block => supabaseService.studioBlocks.delete(block.id)),
        ...existingConnections.map(conn => supabaseService.studioConnections.delete(conn.id)),
      ]);

      // Save new blocks
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

      // Save new connections
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

      toast({ title: 'Project saved', description: 'All changes have been saved successfully' });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Save failed', description: 'Failed to save project', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, getNodes, getEdges]);

  // Context menu handlers
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      node,
    });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDuplicateNode = useCallback((node: Node) => {
    const newNode = {
      ...node,
      id: `node-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    takeSnapshot([...getNodes(), newNode], getEdges());
    toast({ title: 'Node duplicated' });
  }, [setNodes, getNodes, getEdges, takeSnapshot]);

  const handleDeleteNode = useCallback((node: Node) => {
    onDeleteBlock(node.id);
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    takeSnapshot(getNodes().filter((n) => n.id !== node.id), getEdges());
    toast({ title: 'Node deleted' });
  }, [onDeleteBlock, setNodes, getNodes, getEdges, takeSnapshot]);

  const handleEditNode = useCallback((node: Node) => {
    onSelectBlock(node.id);
  }, [onSelectBlock]);

  // Export/Import handlers
  const handleExport = useCallback(() => {
    const data = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studio-${projectId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Canvas exported', description: 'Your canvas has been downloaded as JSON' });
  }, [getNodes, getEdges, projectId]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          takeSnapshot(data.nodes, data.edges);
          toast({ title: 'Canvas imported', description: 'Your canvas has been restored from file' });
        } else {
          toast({ title: 'Invalid file', description: 'The file format is not recognized', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error importing:', error);
        toast({ title: 'Import failed', description: 'Failed to import canvas', variant: 'destructive' });
      }
    };
    input.click();
  }, [setNodes, setEdges, takeSnapshot]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({ title: 'Undone' });
    }
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast({ title: 'Redone' });
    }
  }, [redo, setNodes, setEdges]);

  // Track changes for undo/redo
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        takeSnapshot(getNodes(), getEdges());
      }
    },
    [getNodes, getEdges, takeSnapshot]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close context menu on Escape
      if (e.key === 'Escape' && contextMenu) {
        closeContextMenu();
        return;
      }

      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Cmd/Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y: Redo
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Cmd/Ctrl + A: Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
        toast({ title: 'All nodes selected' });
      }

      // Cmd/Ctrl + E: Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }

      // Cmd/Ctrl + I: Import
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        handleImport();
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
        toast({ title: 'View fitted to canvas' });
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
  }, [addNode, fitView, handleSave, setNodes, zoomIn, zoomOut, handleUndo, handleRedo, handleExport, handleImport, contextMenu, closeContextMenu]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu, closeContextMenu]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background relative" ref={rfRef}>
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
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onSelectionChange={onSelectionChange}
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

        {/* Stats & Actions Panel - Top Right */}
        <Panel position="top-right" className="space-y-2">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>{nodes.length} nodes • {edges.length} connections</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                disabled={!canUndo}
                variant="outline"
                size="sm"
                className="flex-1"
                title="Undo (⌘Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleRedo}
                disabled={!canRedo}
                variant="outline"
                size="sm"
                className="flex-1"
                title="Redo (⌘⇧Z)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="flex-1"
                title="Export (⌘E)"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleImport}
                variant="outline"
                size="sm"
                className="flex-1"
                title="Import (⌘I)"
              >
                <Upload className="w-4 h-4" />
              </Button>
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
                    <span className="text-muted-foreground">Undo</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ Z</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Redo</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘⇧ Z</kbd>
                  </div>
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
                    <span className="text-muted-foreground">Export</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ E</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Import</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">⌘ I</kbd>
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
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Right-click</span>
                    <span className="text-xs text-muted-foreground">Context Menu</span>
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          id="context-menu"
          top={contextMenu.y}
          left={contextMenu.x}
          node={contextMenu.node}
          onClose={closeContextMenu}
          onDuplicate={handleDuplicateNode}
          onDelete={handleDeleteNode}
          onEdit={handleEditNode}
          onFitView={() => fitView({ padding: 0.3, duration: 300 })}
        />
      )}
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
