import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { 
  NodeDefinition, 
  EdgeDefinition,
  NodeStatus,
  DataType,
  Port,
  ArtifactRef,
} from '@/types/computeFlow';
import { NODE_TYPE_CONFIGS } from '@/types/computeFlow';
import { guardStatusTransition } from '@/types/nodeStatusMachine';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Normalize graph IDs to ensure all node/edge IDs are valid UUIDs.
 * This repairs any legacy IDs (e.g., "node-1234567890-0") that may exist.
 */
function normalizeGraphIds(
  nodes: NodeDefinition[],
  edges: EdgeDefinition[]
): { nodes: NodeDefinition[]; edges: EdgeDefinition[]; changed: boolean } {
  const nodeIdMap = new Map<string, string>();
  const portIdMap = new Map<string, string>();
  let changed = false;

  // First pass: map old node IDs to new UUIDs
  const normalizedNodes = nodes.map(node => {
    if (!isValidUuid(node.id)) {
      const newId = uuidv4();
      nodeIdMap.set(node.id, newId);
      changed = true;
      
      // Regenerate ports with new node ID
      const inputs = (node.inputs || []).map((port, i) => {
        const oldPortId = port.id;
        const newPortId = `${newId}-input-${i}`;
        portIdMap.set(oldPortId, newPortId);
        return { ...port, id: newPortId };
      });
      
      const outputs = (node.outputs || []).map((port, i) => {
        const oldPortId = port.id;
        const newPortId = `${newId}-output-${i}`;
        portIdMap.set(oldPortId, newPortId);
        return { ...port, id: newPortId };
      });
      
      return { ...node, id: newId, inputs, outputs };
    }
    return node;
  });

  // Second pass: remap edge references
  const normalizedEdges = edges.map(edge => {
    let edgeChanged = false;
    let newEdge = { ...edge };
    
    // Fix edge ID if invalid
    if (!isValidUuid(edge.id)) {
      newEdge.id = uuidv4();
      edgeChanged = true;
    }
    
    // Remap source node/port
    const newSourceNodeId = nodeIdMap.get(edge.source.nodeId) || edge.source.nodeId;
    const newSourcePortId = portIdMap.get(edge.source.portId) || edge.source.portId;
    if (newSourceNodeId !== edge.source.nodeId || newSourcePortId !== edge.source.portId) {
      newEdge.source = { nodeId: newSourceNodeId, portId: newSourcePortId };
      edgeChanged = true;
    }
    
    // Remap target node/port
    const newTargetNodeId = nodeIdMap.get(edge.target.nodeId) || edge.target.nodeId;
    const newTargetPortId = portIdMap.get(edge.target.portId) || edge.target.portId;
    if (newTargetNodeId !== edge.target.nodeId || newTargetPortId !== edge.target.portId) {
      newEdge.target = { nodeId: newTargetNodeId, portId: newTargetPortId };
      edgeChanged = true;
    }
    
    if (edgeChanged) changed = true;
    return newEdge;
  });

  return { nodes: normalizedNodes, edges: normalizedEdges, changed };
}

interface ExecutionProgress {
  runId: string | null;
  isRunning: boolean;
  completed: number;
  total: number;
  startedAt: Date | null;
  error: string | null;
}

interface ComputeFlowState {
  nodeDefinitions: NodeDefinition[];
  edgeDefinitions: EdgeDefinition[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  execution: ExecutionProgress;
  
  // Actions
  loadGraph: (projectId: string) => Promise<void>;
  saveGraph: (projectId: string) => Promise<void>;
  addNode: (node: NodeDefinition) => void;
  createNode: (kind: NodeDefinition['kind'], position: { x: number; y: number }) => NodeDefinition;
  updateNode: (nodeId: string, updates: Partial<NodeDefinition>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: EdgeDefinition) => void;
  removeEdge: (edgeId: string) => void;
  setNodeStatus: (nodeId: string, status: NodeStatus, progress?: number, preview?: any) => void;
  setNodePreview: (nodeId: string, preview: any) => void;
  executeGraph: (projectId: string) => Promise<void>;
  executeGraphStreaming: (projectId: string) => Promise<void>;
  cancelExecution: () => void;
  clearGraph: () => void;
  resetNodeStatuses: () => void;
  
  // AI Workflow Generation
  addGeneratedWorkflow: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => void;
}

// Abort controller for cancellation
let executionAbortController: AbortController | null = null;

export const useComputeFlowStore = create<ComputeFlowState>((set, get) => ({
  nodeDefinitions: [],
  edgeDefinitions: [],
  isLoading: false,
  isSaving: false,
  error: null,
  execution: {
    runId: null,
    isRunning: false,
    completed: 0,
    total: 0,
    startedAt: null,
    error: null,
  },

  loadGraph: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: nodes, error: nodesError } = await supabase
        .from('compute_nodes')
        .select('*')
        .eq('project_id', projectId);

      const { data: edges, error: edgesError } = await supabase
        .from('compute_edges')
        .select('*')
        .eq('project_id', projectId);

      if (nodesError) throw nodesError;
      if (edgesError) throw edgesError;

      // Transform database format to frontend format
      const nodeDefinitions: NodeDefinition[] = (nodes || []).map(n => ({
        id: n.id,
        kind: n.kind as NodeDefinition['kind'],
        version: n.version,
        label: n.label,
        position: n.position as { x: number; y: number },
        size: n.size as { w: number; h: number } | undefined,
        inputs: (n.inputs as unknown as Port[]) || [],
        outputs: (n.outputs as unknown as Port[]) || [],
        params: (n.params as Record<string, unknown>) || {},
        metadata: (n.metadata as Record<string, unknown>) || undefined,
        preview: (n.preview as unknown as ArtifactRef) || undefined,
        status: n.status as NodeStatus,
        progress: n.progress || 0,
        error: n.error || undefined,
        isDirty: n.is_dirty || false,
      }));

      const edgeDefinitions: EdgeDefinition[] = (edges || []).map(e => ({
        id: e.id,
        source: { nodeId: e.source_node_id, portId: e.source_port_id },
        target: { nodeId: e.target_node_id, portId: e.target_port_id },
        dataType: e.data_type as DataType,
        status: e.status as EdgeDefinition['status'],
        metadata: (e.metadata as EdgeDefinition['metadata']) || undefined,
      }));

      console.log('📥 Loaded compute graph:', { nodes: nodeDefinitions.length, edges: edgeDefinitions.length });
      set({ nodeDefinitions, edgeDefinitions, isLoading: false });
    } catch (error: any) {
      console.error('Error loading graph:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  saveGraph: async (projectId: string) => {
    let { nodeDefinitions, edgeDefinitions } = get();
    set({ isSaving: true });

    try {
      // Normalize IDs before saving to ensure all are valid UUIDs
      const { nodes: normalizedNodes, edges: normalizedEdges, changed } = normalizeGraphIds(
        nodeDefinitions,
        edgeDefinitions
      );
      
      if (changed) {
        console.log('🔧 Normalized legacy node/edge IDs to UUIDs');
        toast.info('Repaired legacy node IDs for compatibility');
        // Update store with normalized IDs
        set({ nodeDefinitions: normalizedNodes, edgeDefinitions: normalizedEdges });
        nodeDefinitions = normalizedNodes;
        edgeDefinitions = normalizedEdges;
      }

      const { error } = await supabase.functions.invoke('compute-save-graph', {
        body: {
          projectId,
          nodes: nodeDefinitions,
          edges: edgeDefinitions,
        },
      });

      if (error) throw error;
      console.log('💾 Compute graph saved');
      set({ isSaving: false });
    } catch (error: any) {
      console.error('Error saving graph:', error);
      set({ error: error.message, isSaving: false });
    }
  },

  createNode: (kind: NodeDefinition['kind'], position: { x: number; y: number }) => {
    const config = NODE_TYPE_CONFIGS[kind];
    const nodeId = uuidv4();
    
    // Generate port IDs
    const inputs: Port[] = (config?.inputs || []).map((input, i) => ({
      ...input,
      id: `${nodeId}-input-${i}`,
    }));
    
    const outputs: Port[] = (config?.outputs || []).map((output, i) => ({
      ...output,
      id: `${nodeId}-output-${i}`,
    }));

    const node: NodeDefinition = {
      id: nodeId,
      kind,
      version: '1.0.0',
      label: `${kind} Node`,
      position,
      size: { w: 420, h: 300 },
      inputs,
      outputs,
      params: {},
      status: 'idle',
      progress: 0,
    };

    return node;
  },

  addNode: (node) => {
    set(state => ({
      nodeDefinitions: [...state.nodeDefinitions, node],
    }));
  },

  updateNode: (nodeId, updates) => {
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
    }));
  },

  removeNode: (nodeId) => {
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.filter(n => n.id !== nodeId),
      edgeDefinitions: state.edgeDefinitions.filter(
        e => e.source.nodeId !== nodeId && e.target.nodeId !== nodeId
      ),
    }));
  },

  addEdge: (edge) => {
    set(state => ({
      edgeDefinitions: [...state.edgeDefinitions, edge],
    }));
  },

  removeEdge: (edgeId) => {
    set(state => ({
      edgeDefinitions: state.edgeDefinitions.filter(e => e.id !== edgeId),
    }));
  },

  setNodeStatus: (nodeId, status, progress, preview) => {
    const node = get().nodeDefinitions.find(n => n.id === nodeId);
    if (node) {
      guardStatusTransition(node.status, status, nodeId);
    }
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n =>
        n.id === nodeId 
          ? { 
              ...n, 
              status, 
              progress: progress ?? n.progress,
              preview: preview ?? n.preview,
            } 
          : n
      ),
    }));
  },

  setNodePreview: (nodeId, preview) => {
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n =>
        n.id === nodeId ? { ...n, preview } : n
      ),
    }));
  },

  resetNodeStatuses: () => {
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n => ({
        ...n,
        status: 'idle',
        progress: 0,
        error: undefined,
      })),
      execution: {
        runId: null,
        isRunning: false,
        completed: 0,
        total: 0,
        startedAt: null,
        error: null,
      },
    }));
  },

  /**
   * Execute graph with SSE streaming updates
   */
  executeGraphStreaming: async (projectId: string) => {
    const { execution, nodeDefinitions } = get();
    
    if (execution.isRunning) {
      console.warn('Execution already in progress');
      return;
    }

    console.log('🚀 Executing compute graph with streaming...');

    // Reset all node statuses to queued
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n => ({
        ...n,
        status: 'queued' as NodeStatus,
        progress: 0,
        error: undefined,
      })),
      execution: {
        runId: null,
        isRunning: true,
        completed: 0,
        total: nodeDefinitions.length,
        startedAt: new Date(),
        error: null,
      },
    }));

    // Create abort controller
    executionAbortController = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/compute-execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ projectId }),
          signal: executionAbortController.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/event-stream')) {
        // Process SSE stream
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('event:')) {
              currentEvent = trimmedLine.slice(6).trim();
              continue;
            }
            
            if (trimmedLine.startsWith('data:')) {
              const jsonStr = trimmedLine.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);
                handleSSEEvent(currentEvent || 'message', data, set, get);
              } catch (e) {
                console.warn('Failed to parse SSE data:', jsonStr);
              }
            }
          }
        }
      } else {
        // Handle JSON response (fallback)
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        set(state => ({
          execution: {
            ...state.execution,
            runId: data.runId,
            isRunning: false,
          },
        }));
      }

    } catch (error: any) {
      console.error('Execution error:', error);
      
      const errorMessage = error.name === 'AbortError' ? 'Cancelled' : error.message;
      
      set(state => ({
        error: errorMessage,
        execution: {
          ...state.execution,
          isRunning: false,
          error: errorMessage,
        },
      }));
    }
  },

  /**
   * Cancel the current execution
   */
  cancelExecution: () => {
    console.log('🛑 Cancelling execution');
    
    if (executionAbortController) {
      executionAbortController.abort();
      executionAbortController = null;
    }

    set(state => ({
      execution: {
        ...state.execution,
        isRunning: false,
        error: 'Cancelled',
      },
    }));
  },

  /**
   * Legacy execute (kept for backwards compatibility)
   */
  executeGraph: async (projectId: string) => {
    // Use streaming version by default
    return get().executeGraphStreaming(projectId);
  },

  clearGraph: () => {
    set({
      nodeDefinitions: [],
      edgeDefinitions: [],
      error: null,
      execution: {
        runId: null,
        isRunning: false,
        completed: 0,
        total: 0,
        startedAt: null,
        error: null,
      },
    });
  },

  /**
   * Add AI-generated workflow nodes and edges to the canvas
   * Uses phased approach: add nodes first, then edges after React Flow initializes
   */
  addGeneratedWorkflow: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
    console.log('🎨 Adding generated workflow:', { nodes: nodes.length, edges: edges.length });
    
    // Log incoming data for debugging
    console.log('📦 Incoming nodes:', nodes.map(n => ({ id: n.id, kind: n.kind, outputs: n.outputs?.map(o => o.id) })));
    console.log('📦 Incoming edges:', edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    
    // Normalize incoming workflow IDs to ensure they're valid UUIDs
    const { nodes: normalizedNodes, edges: normalizedEdges, changed } = normalizeGraphIds(nodes, edges);
    
    if (changed) {
      console.log('🔧 Normalized incoming workflow IDs to UUIDs');
      console.log('📦 Normalized edges:', normalizedEdges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    }
    
    // Verify edge port IDs match actual node port IDs
    const validatedEdges = normalizedEdges.filter(edge => {
      const sourceNode = normalizedNodes.find(n => n.id === edge.source.nodeId);
      const targetNode = normalizedNodes.find(n => n.id === edge.target.nodeId);
      
      if (!sourceNode || !targetNode) {
        console.warn('⚠️ Edge references non-existent node:', edge);
        return false;
      }
      
      const sourcePort = sourceNode.outputs?.find(p => p.id === edge.source.portId);
      const targetPort = targetNode.inputs?.find(p => p.id === edge.target.portId);
      
      if (!sourcePort) {
        // Try to find any matching output port
        const fallbackPort = sourceNode.outputs?.[0];
        if (fallbackPort) {
          console.log('🔧 Fixing source port ID:', edge.source.portId, '->', fallbackPort.id);
          edge.source.portId = fallbackPort.id;
        } else {
          console.warn('⚠️ No output ports on source node:', sourceNode.id);
          return false;
        }
      }
      
      if (!targetPort) {
        // Try to find any matching input port
        const fallbackPort = targetNode.inputs?.[0];
        if (fallbackPort) {
          console.log('🔧 Fixing target port ID:', edge.target.portId, '->', fallbackPort.id);
          edge.target.portId = fallbackPort.id;
        } else {
          console.warn('⚠️ No input ports on target node:', targetNode.id);
          return false;
        }
      }
      
      return true;
    });
    
    console.log('✅ Validated edges:', validatedEdges.length, 'of', normalizedEdges.length);
    
    // Phase 1: Add nodes first
    set(state => ({
      nodeDefinitions: [...state.nodeDefinitions, ...normalizedNodes],
    }));
    
    // Phase 2: Add edges after a short delay to allow React Flow to initialize nodes
    if (validatedEdges.length > 0) {
      setTimeout(() => {
        set(state => ({
          edgeDefinitions: [...state.edgeDefinitions, ...validatedEdges],
        }));
        console.log('✅ Edges added after node initialization delay');
      }, 100);
    }
  },
}));

/**
 * Handle SSE events from compute-execute
 */
function handleSSEEvent(
  event: string,
  data: any,
  set: any,
  get: () => ComputeFlowState
) {
  console.log(`📨 SSE Event: ${event}`, data);

  switch (event) {
    case 'meta':
      set((state: ComputeFlowState) => ({
        execution: {
          ...state.execution,
          runId: data.run_id,
          total: data.total_nodes || state.execution.total,
        },
      }));
      break;

    case 'node_status':
      const { node_id, status, output, error, processing_time_ms } = data;
      const mappedStatus = mapStatus(status);
      
      set((state: ComputeFlowState) => {
        const isCompleted = ['completed', 'failed', 'skipped'].includes(status);
        
        return {
          nodeDefinitions: state.nodeDefinitions.map(n =>
            n.id === node_id
              ? {
                  ...n,
                  status: mappedStatus,
                  progress: isCompleted ? 100 : (status === 'running' ? 50 : 0),
                  preview: output || n.preview,
                  error: error || undefined,
                }
              : n
          ),
          execution: {
            ...state.execution,
            completed: isCompleted 
              ? state.execution.completed + 1 
              : state.execution.completed,
          },
        };
      });
      break;

    case 'node_progress':
      const { node_id: progressNodeId, progress } = data;
      
      set((state: ComputeFlowState) => ({
        nodeDefinitions: state.nodeDefinitions.map(n =>
          n.id === progressNodeId
            ? { ...n, progress: progress || n.progress }
            : n
        ),
      }));
      break;

    case 'complete':
      set((state: ComputeFlowState) => ({
        execution: {
          ...state.execution,
          isRunning: false,
          completed: data.completed_nodes || state.execution.completed,
          total: data.total_nodes || state.execution.total,
        },
      }));
      break;

    case 'error':
      set((state: ComputeFlowState) => ({
        error: data.error,
        execution: {
          ...state.execution,
          isRunning: false,
          error: data.error,
        },
      }));
      break;
  }
}

/**
 * Map backend status to frontend NodeStatus
 */
function mapStatus(backendStatus: string): NodeStatus {
  switch (backendStatus) {
    case 'running': return 'running';
    case 'completed': return 'succeeded';
    case 'succeeded': return 'succeeded';
    case 'failed': return 'failed';
    case 'skipped': return 'failed';
    case 'pending': return 'queued';
    case 'queued': return 'queued';
    default: return 'idle';
  }
}
