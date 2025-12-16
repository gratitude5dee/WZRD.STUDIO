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
import { v4 as uuidv4 } from 'uuid';

interface ComputeFlowState {
  nodeDefinitions: NodeDefinition[];
  edgeDefinitions: EdgeDefinition[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadGraph: (projectId: string) => Promise<void>;
  saveGraph: (projectId: string) => Promise<void>;
  addNode: (node: NodeDefinition) => void;
  createNode: (kind: NodeDefinition['kind'], position: { x: number; y: number }) => NodeDefinition;
  updateNode: (nodeId: string, updates: Partial<NodeDefinition>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: EdgeDefinition) => void;
  removeEdge: (edgeId: string) => void;
  setNodeStatus: (nodeId: string, status: NodeStatus, progress?: number) => void;
  executeGraph: (projectId: string) => Promise<void>;
  clearGraph: () => void;
}

export const useComputeFlowStore = create<ComputeFlowState>((set, get) => ({
  nodeDefinitions: [],
  edgeDefinitions: [],
  isLoading: false,
  isSaving: false,
  error: null,

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
    const { nodeDefinitions, edgeDefinitions } = get();
    set({ isSaving: true });

    try {
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

  setNodeStatus: (nodeId, status, progress) => {
    set(state => ({
      nodeDefinitions: state.nodeDefinitions.map(n =>
        n.id === nodeId ? { ...n, status, progress: progress ?? n.progress } : n
      ),
    }));
  },

  executeGraph: async (projectId: string) => {
    try {
      console.log('🚀 Executing compute graph...');
      const { data, error } = await supabase.functions.invoke('compute-execute', {
        body: { projectId },
      });

      if (error) throw error;

      console.log('✅ Execution started, run ID:', data?.runId);

      // Set up realtime subscription for run events
      if (data?.runId) {
        const channel = supabase
          .channel(`run:${data.runId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'compute_run_events',
            filter: `run_id=eq.${data.runId}`,
          }, (payload) => {
            const event = payload.new as any;
            if (event) {
              get().setNodeStatus(event.node_id, event.status, event.progress);
            }
          })
          .subscribe();

        // Cleanup subscription after 5 minutes (max execution time)
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 300000);
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      set({ error: error.message });
    }
  },

  clearGraph: () => {
    set({
      nodeDefinitions: [],
      edgeDefinitions: [],
      error: null,
    });
  },
}));
