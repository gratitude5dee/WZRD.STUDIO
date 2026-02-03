import React, { useCallback, useState, useMemo, useRef } from 'react';
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
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Position,
  OnMove,
  BackgroundVariant
} from 'reactflow';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { PortalHeader } from '@/components/ui/portal-header';
import { 
  Brain, 
  Plus, 
  Search, 
  Layers, 
  Zap, 
  Orbit, 
  Atom, 
  Star,
  Sparkles,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConceptNode } from './ConceptNode';
import { ConnectionNode } from './ConnectionNode';
import { KnowledgeCluster } from './KnowledgeCluster';
import 'reactflow/dist/style.css';

// Node types for the knowledge canvas
const nodeTypes: NodeTypes = {
  concept: ConceptNode,
  connection: ConnectionNode,
  cluster: KnowledgeCluster,
};

// Initial knowledge graph data
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'concept',
    position: { x: 250, y: 100 },
    data: { 
      label: 'AI Storytelling',
      description: 'The fusion of artificial intelligence with narrative creation',
      category: 'core',
      connections: 3,
      strength: 0.9
    },
  },
  {
    id: '2',
    type: 'concept',
    position: { x: 100, y: 200 },
    data: { 
      label: 'Visual Prompting',
      description: 'Converting text descriptions into visual concepts',
      category: 'technique',
      connections: 2,
      strength: 0.7
    },
  },
  {
    id: '3',
    type: 'concept',
    position: { x: 400, y: 200 },
    data: { 
      label: 'Character Development',
      description: 'Creating consistent and compelling characters',
      category: 'creative',
      connections: 4,
      strength: 0.8
    },
  },
  {
    id: '4',
    type: 'cluster',
    position: { x: 250, y: 350 },
    data: { 
      label: 'Video Generation',
      description: 'Cluster of video creation techniques',
      category: 'cluster',
      concepts: ['Motion', 'Timing', 'Transitions'],
      strength: 0.6
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default',
    animated: true,
    style: { stroke: 'hsl(var(--cosmic-stellar))', strokeWidth: 2 }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'default',
    animated: true,
    style: { stroke: 'hsl(var(--cosmic-plasma))', strokeWidth: 2 }
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    type: 'default',
    style: { stroke: 'hsl(var(--cosmic-quantum))', strokeWidth: 2 }
  },
];

interface KnowledgeCanvasProps {
  className?: string;
}

const KnowledgeCanvasContent: React.FC<KnowledgeCanvasProps> = ({ className }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Semantic zoom - show different detail levels based on zoom
  const visibleNodes = useMemo(() => {
    if (!isSemanticMode) return nodes;
    
    if (zoomLevel < 0.5) {
      // High level view - only show clusters
      return nodes.filter(node => node.type === 'cluster');
    } else if (zoomLevel < 1) {
      // Medium level - show core concepts and clusters
      return nodes.filter(node => 
        node.type === 'cluster' || 
        (node.type === 'concept' && node.data.category === 'core')
      );
    }
    return nodes; // Full detail view
  }, [nodes, zoomLevel, isSemanticMode]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return visibleNodes;
    return visibleNodes.filter(node =>
      node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visibleNodes, searchQuery]);

  const addConceptNode = useCallback(() => {
    const newNode: Node = {
      id: `concept-${Date.now()}`,
      type: 'concept',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: 'New Concept',
        description: 'Click to edit this concept',
        category: 'new',
        connections: 0,
        strength: 0.5
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <div className={`h-full w-full bg-cosmic-void relative overflow-hidden ${className}`}>
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-nebula-field opacity-20 pointer-events-none" />
      <div className="absolute inset-0 particle-field opacity-15 pointer-events-none" />
      
      {/* Knowledge Canvas Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <PortalHeader 
          title="Knowledge Canvas" 
          subtitle="Navigate the cosmic web of ideas"
          cosmic={true}
          actions={
            <div className="flex space-x-2">
              <GlassButton 
                variant={isSemanticMode ? "stellar" : "ghost"} 
                size="sm"
                onClick={() => setIsSemanticMode(!isSemanticMode)}
              >
                <Layers className="w-4 h-4" />
                Semantic
              </GlassButton>
              <GlassButton 
                variant={showClusters ? "stellar" : "ghost"} 
                size="sm"
                onClick={() => setShowClusters(!showClusters)}
              >
                <Orbit className="w-4 h-4" />
                Clusters
              </GlassButton>
            </div>
          }
        />
      </div>

      {/* Search Panel */}
      <div className="absolute top-32 left-4 z-10">
        <GlassCard variant="cosmic" depth="shallow" className="p-4 w-80">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cosmic-stellar/60" />
              <input
                type="text"
                placeholder="Search knowledge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input pl-10 pr-4 py-2 text-sm rounded-lg"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-cosmic-stellar/40 animate-pulse" />
            </div>
            
            <div className="flex space-x-2">
              <GlassButton variant="void" size="sm" onClick={addConceptNode}>
                <Plus className="w-3 h-3" />
                Concept
              </GlassButton>
              <GlassButton variant="cosmic" size="sm">
                <Brain className="w-3 h-3" />
                AI Suggest
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* React Flow Canvas */}
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          className="cosmic-flow"
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20} 
            size={1}
            style={{
              backgroundColor: 'hsl(var(--cosmic-void))',
              opacity: 0.3
            }}
          />
          <Controls 
            className="cosmic-controls"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data.category) {
                case 'core': return 'hsl(var(--cosmic-stellar))';
                case 'technique': return 'hsl(var(--cosmic-plasma))';
                case 'creative': return 'hsl(var(--cosmic-quantum))';
                case 'cluster': return 'hsl(var(--cosmic-nebula))';
                default: return 'hsl(var(--cosmic-temporal))';
              }
            }}
            className="cosmic-minimap"
            pannable
            zoomable
          />
          
          {/* Cosmic Status Panel */}
          <Panel position="bottom-left" className="m-4">
            <GlassCard variant="void" depth="shallow" className="p-3">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Atom className="w-3 h-3 text-cosmic-stellar animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-cosmic-stellar">{filteredNodes.length} Concepts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-cosmic-plasma animate-pulse" />
                  <span className="text-cosmic-plasma">{edges.length} Connections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-cosmic-quantum animate-pulse" style={{ animationDelay: '1s' }} />
                  <span className="text-cosmic-quantum">Zoom: {Math.round(zoomLevel * 100)}%</span>
                </div>
              </div>
            </GlassCard>
          </Panel>
        </ReactFlow>
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-32 right-4 z-10 w-80"
          >
            <GlassCard variant="stellar" depth="deep" glow="medium" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold glow-text-primary">{selectedNode.data.label}</h3>
                  <GlassButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                  >
                    ×
                  </GlassButton>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {selectedNode.data.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-cosmic-stellar/20 text-cosmic-stellar border border-cosmic-stellar/30">
                    {selectedNode.data.category}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-cosmic-plasma/20 text-cosmic-plasma border border-cosmic-plasma/30">
                    {selectedNode.data.connections} connections
                  </span>
                </div>
                
                <div className="space-y-2">
                  <GlassButton variant="cosmic" size="sm" className="w-full">
                    <Brain className="w-3 h-3" />
                    Expand Concept
                  </GlassButton>
                  <GlassButton variant="void" size="sm" className="w-full">
                    <Sparkles className="w-3 h-3" />
                    Generate Related
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const KnowledgeCanvas: React.FC<KnowledgeCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <KnowledgeCanvasContent {...props} />
    </ReactFlowProvider>
  );
};