import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useReactFlow } from 'reactflow';
import { toast } from '@/hooks/use-toast';

export interface ExecutionStatus {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  totalNodes: number;
  completedNodes: number;
}

export interface NodeStatus {
  nodeId: string;
  status: 'idle' | 'queued' | 'generating' | 'complete' | 'error';
  progress?: number;
  outputs?: Record<string, any>;
  error?: string;
}

/**
 * Hook for real-time execution updates via Supabase Realtime
 */
export const useRealtimeExecution = (
  currentRunId: string | null,
  onExecutionComplete?: () => void,
  onExecutionFailed?: (error: string) => void
) => {
  const { setNodes } = useReactFlow();

  // Subscribe to node status updates
  useEffect(() => {
    if (!currentRunId) return;

    const channel = supabase
      .channel('execution-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'execution_node_status',
          filter: `run_id=eq.${currentRunId}`,
        },
        (payload) => {
          const nodeStatus = payload.new as NodeStatus;
          
          // Update node in React Flow
          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id === nodeStatus.nodeId) {
                const updatedData: any = {
                  ...node.data,
                  status: nodeStatus.status,
                  progress: nodeStatus.progress,
                  outputs: nodeStatus.outputs,
                  error: nodeStatus.error,
                };

                // Update imageUrl if image output is available
                if (nodeStatus.outputs?.['image-out']?.url) {
                  updatedData.imageUrl = nodeStatus.outputs['image-out'].url;
                }

                return {
                  ...node,
                  data: updatedData,
                };
              }
              return node;
            })
          );

          // Show completion toasts
          if (nodeStatus.status === 'complete') {
            toast({
              title: 'Node Complete',
              description: `Successfully generated output`,
            });
          } else if (nodeStatus.status === 'error' && nodeStatus.error) {
            toast({
              title: 'Node Execution Failed',
              description: nodeStatus.error,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRunId, setNodes]);

  // Subscribe to workflow run status
  useEffect(() => {
    if (!currentRunId) return;

    const channel = supabase
      .channel('run-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'execution_runs',
          filter: `id=eq.${currentRunId}`,
        },
        (payload) => {
          const runStatus = payload.new as ExecutionStatus;

          if (runStatus.status === 'completed') {
            toast({
              title: 'Workflow Complete',
              description: `All ${runStatus.totalNodes} nodes executed successfully`,
            });
            onExecutionComplete?.();
          } else if (runStatus.status === 'failed') {
            const errorMsg = (payload.new as any).error_message || 'Unknown error';
            toast({
              title: 'Workflow Failed',
              description: errorMsg,
              variant: 'destructive',
            });
            onExecutionFailed?.(errorMsg);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRunId, onExecutionComplete, onExecutionFailed]);

  const resetNodeStatuses = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: 'idle',
          progress: 0,
          error: undefined,
        },
      }))
    );
  }, [setNodes]);

  return { resetNodeStatuses };
};
