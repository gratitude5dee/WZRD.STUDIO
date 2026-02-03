import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface SavedFlow {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  isTemplate?: boolean;
  tags?: string[];
}

interface FlowsState {
  savedFlows: SavedFlow[];
  isLoading: boolean;
  error: string | null;
  selectedFlowId: string | null;

  fetchFlows: (projectId: string) => Promise<void>;
  saveCurrentFlow: (projectId: string, name: string, description?: string) => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
  deleteFlow: (flowId: string) => Promise<void>;
  duplicateFlow: (flowId: string, newName: string) => Promise<void>;
  renameFlow: (flowId: string, newName: string) => Promise<void>;
  setSelectedFlow: (flowId: string | null) => void;
}

export const useFlowsStore = create<FlowsState>()(
  persist(
    (set, get) => ({
      savedFlows: [],
      isLoading: false,
      error: null,
      selectedFlowId: null,

      fetchFlows: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await (supabase
            .from('saved_flows' as any)
            .select('*')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false }) as any);

          if (error) throw error;

          set({
            savedFlows:
              (data as any[])?.map((flow: any) => ({
                id: flow.id,
                name: flow.name,
                description: flow.description,
                thumbnail: flow.thumbnail_url,
                nodeCount: flow.node_count || 0,
                edgeCount: flow.edge_count || 0,
                createdAt: new Date(flow.created_at),
                updatedAt: new Date(flow.updated_at),
                projectId: flow.project_id,
                isTemplate: flow.is_template,
                tags: flow.tags,
              })) || [],
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      saveCurrentFlow: async (projectId: string, name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { useComputeFlowStore } = await import('@/store/computeFlowStore');
          const { nodeDefinitions, edgeDefinitions } = useComputeFlowStore.getState();

          const { error } = await (supabase
            .from('saved_flows' as any)
            .insert({
              project_id: projectId,
              name,
              description,
              node_count: nodeDefinitions.length,
              edge_count: edgeDefinitions.length,
              flow_data: { nodes: nodeDefinitions, edges: edgeDefinitions },
            }) as any);

          if (error) throw error;

          await get().fetchFlows(projectId);
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadFlow: async (flowId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await (supabase
            .from('saved_flows' as any)
            .select('flow_data')
            .eq('id', flowId)
            .single() as any);

          if (error) throw error;

          const { useComputeFlowStore } = await import('@/store/computeFlowStore');
          const { setGraphAtomic } = useComputeFlowStore.getState();

          if (data?.flow_data) {
            setGraphAtomic(data.flow_data.nodes || [], data.flow_data.edges || [], {
              skipHistory: false,
              skipDirty: false,
            });
          }

          set({ selectedFlowId: flowId, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteFlow: async (flowId: string) => {
        try {
          const { error } = await (supabase.from('saved_flows' as any).delete().eq('id', flowId) as any);

          if (error) throw error;

          set((state) => ({
            savedFlows: state.savedFlows.filter((flow) => flow.id !== flowId),
            selectedFlowId: state.selectedFlowId === flowId ? null : state.selectedFlowId,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      duplicateFlow: async (flowId: string, newName: string) => {
        const flow = get().savedFlows.find((item) => item.id === flowId);
        if (!flow) return;

        try {
          const { data: originalData } = await (supabase
            .from('saved_flows' as any)
            .select('flow_data')
            .eq('id', flowId)
            .single() as any);

          const { error } = await (supabase.from('saved_flows' as any).insert({
            project_id: flow.projectId,
            name: newName,
            description: flow.description,
            flow_data: originalData?.flow_data,
            node_count: flow.nodeCount,
            edge_count: flow.edgeCount,
          }) as any);

          if (error) throw error;

          await get().fetchFlows(flow.projectId);
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      renameFlow: async (flowId: string, newName: string) => {
        try {
          const { error } = await (supabase
            .from('saved_flows' as any)
            .update({ name: newName, updated_at: new Date().toISOString() })
            .eq('id', flowId) as any);

          if (error) throw error;

          set((state) => ({
            savedFlows: state.savedFlows.map((flow) =>
              flow.id === flowId ? { ...flow, name: newName, updatedAt: new Date() } : flow
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      setSelectedFlow: (flowId: string | null) => {
        set({ selectedFlowId: flowId });
      },
    }),
    {
      name: 'wzrd-flows-storage',
      partialize: (state) => ({ selectedFlowId: state.selectedFlowId }),
    }
  )
);
