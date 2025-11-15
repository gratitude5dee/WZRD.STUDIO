import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TimelinePanel from './timeline/TimelinePanel';
import { VideoClipNode } from './nodes/VideoClipNode';
import { AudioTrackNode } from './nodes/AudioTrackNode';
import { TransitionNode } from './nodes/TransitionNode';
import { CustomEdge } from './edges/CustomEdge';
import { useVideoEditorStore } from '@/store/videoEditorStore';

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  videoClip: VideoClipNode,
  audioTrack: AudioTrackNode,
  transition: TransitionNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const FlowContent: React.FC = () => {
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Layout state
  const [canvasHeight, setCanvasHeight] = useState(60); // percentage

  // Connection handler
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'custom',
      animated: true,
      data: { color: '#8B5CF6' }
    }, eds));
  }, [setEdges]);

  // Node click handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Drop handler from timeline to canvas
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow-type');
    const clipId = event.dataTransfer.getData('application/reactflow-clipid');
    
    if (!type || !clipId) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const newNode: Node = {
      id: `node-${clipId}-${Date.now()}`,
      type,
      position,
      data: {
        clipId,
        name: clip.name,
        url: clip.url,
        duration: clip.duration,
        thumbnailUrl: clip.url,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [clips, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950">
      {/* ReactFlow Canvas */}
      <div 
        className="relative border-b border-white/[0.08]"
        style={{ height: `${canvasHeight}%` }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-zinc-950"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#ffffff08"
          />
          <Controls className="bg-black/50 backdrop-blur-sm border border-white/[0.08]" />
          <MiniMap
            className="bg-black/50 backdrop-blur-sm border border-white/[0.08]"
            nodeColor="#8B5CF6"
            maskColor="#0A0A0A90"
          />
          
          {/* Info Panel */}
          <Panel position="top-left" className="bg-black/50 backdrop-blur-sm border border-white/[0.08] rounded-lg p-3">
            <div className="text-xs text-white/60 space-y-1">
              <div>Nodes: {nodes.length}</div>
              <div>Connections: {edges.length}</div>
              <div>Composition Active</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Timeline Panel */}
      <div 
        className="relative"
        style={{ height: `${100 - canvasHeight}%` }}
      >
        <TimelinePanel />
      </div>

      {/* Resize Handle */}
      <div
        className="absolute left-0 right-0 h-1 bg-white/[0.08] hover:bg-purple-500/50 cursor-ns-resize transition-colors z-50"
        style={{ top: `${canvasHeight}%` }}
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startHeight = canvasHeight;

          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const newHeight = Math.min(80, Math.max(20, startHeight + (deltaY / window.innerHeight) * 100));
            setCanvasHeight(newHeight);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
};

export const UnifiedEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
};
