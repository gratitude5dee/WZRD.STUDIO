import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NodeStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped';

export interface NodeExecutionState {
  status: NodeStatus;
  progress?: number;
  output?: any;
  error?: string;
  processingTimeMs?: number;
}

export interface ExecutionState {
  isRunning: boolean;
  runId: string | null;
  projectId: string | null;
  nodeStates: Record<string, NodeExecutionState>;
  progress: { completed: number; total: number };
  startedAt: Date | null;
  error: string | null;
}

interface UseStudioExecutionOptions {
  onNodeStatusChange?: (nodeId: string, status: NodeStatus, output?: any, error?: string) => void;
  onComplete?: (outputs: Record<string, any>, failedNodes: string[]) => void;
  onError?: (error: string) => void;
}

export function useStudioExecution(options: UseStudioExecutionOptions = {}) {
  const { onNodeStatusChange, onComplete, onError } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [state, setState] = useState<ExecutionState>({
    isRunning: false,
    runId: null,
    projectId: null,
    nodeStates: {},
    progress: { completed: 0, total: 0 },
    startedAt: null,
    error: null,
  });

  /**
   * Execute a compute graph with SSE streaming updates
   */
  const execute = useCallback(async (projectId: string) => {
    if (state.isRunning) {
      toast.warning('Execution already in progress');
      return;
    }

    console.log('🚀 [StudioExecution] Starting execution for project:', projectId);

    // Reset state
    setState({
      isRunning: true,
      runId: null,
      projectId,
      nodeStates: {},
      progress: { completed: 0, total: 0 },
      startedAt: new Date(),
      error: null,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call edge function with SSE streaming
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/compute-execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ projectId }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Check if response is SSE or JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/event-stream')) {
        // Process SSE stream
        await processSSEStream(response, setState, onNodeStatusChange, onComplete);
      } else {
        // Handle regular JSON response (fallback)
        const data = await response.json();
        console.log('📦 [StudioExecution] JSON response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setState(s => ({ 
          ...s, 
          isRunning: false,
          runId: data.runId,
        }));
        
        toast.success('Execution completed');
      }

    } catch (error: any) {
      console.error('❌ [StudioExecution] Error:', error);
      
      if (error.name === 'AbortError') {
        toast.info('Execution cancelled');
        setState(s => ({ ...s, isRunning: false, error: 'Cancelled' }));
      } else {
        const errorMessage = error.message || 'Unknown error';
        toast.error(`Execution failed: ${errorMessage}`);
        setState(s => ({ ...s, isRunning: false, error: errorMessage }));
        onError?.(errorMessage);
      }
    }
  }, [state.isRunning, onNodeStatusChange, onComplete, onError]);

  /**
   * Cancel the current execution
   */
  const cancel = useCallback(() => {
    console.log('🛑 [StudioExecution] Cancelling execution');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(s => ({ ...s, isRunning: false, error: 'Cancelled' }));
  }, []);

  /**
   * Reset execution state
   */
  const reset = useCallback(() => {
    setState({
      isRunning: false,
      runId: null,
      projectId: null,
      nodeStates: {},
      progress: { completed: 0, total: 0 },
      startedAt: null,
      error: null,
    });
  }, []);

  /**
   * Get the status of a specific node
   */
  const getNodeStatus = useCallback((nodeId: string): NodeExecutionState | undefined => {
    return state.nodeStates[nodeId];
  }, [state.nodeStates]);

  return {
    ...state,
    execute,
    cancel,
    reset,
    getNodeStatus,
  };
}

/**
 * Process SSE stream from compute-execute edge function
 */
async function processSSEStream(
  response: Response,
  setState: React.Dispatch<React.SetStateAction<ExecutionState>>,
  onNodeStatusChange?: (nodeId: string, status: NodeStatus, output?: any, error?: string) => void,
  onComplete?: (outputs: Record<string, any>, failedNodes: string[]) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Parse event type
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.slice(6).trim();
          continue;
        }
        
        // Parse data
        if (trimmedLine.startsWith('data:')) {
          const jsonStr = trimmedLine.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            handleSSEEvent(currentEvent || 'message', data, setState, onNodeStatusChange, onComplete);
          } catch (e) {
            console.warn('[StudioExecution] Failed to parse SSE data:', jsonStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Handle individual SSE events
 */
function handleSSEEvent(
  event: string,
  data: any,
  setState: React.Dispatch<React.SetStateAction<ExecutionState>>,
  onNodeStatusChange?: (nodeId: string, status: NodeStatus, output?: any, error?: string) => void,
  onComplete?: (outputs: Record<string, any>, failedNodes: string[]) => void,
) {
  console.log(`📨 [StudioExecution] SSE Event: ${event}`, data);

  switch (event) {
    case 'meta':
      // Initial metadata with run_id and total_nodes
      setState(s => ({
        ...s,
        runId: data.run_id,
        progress: { ...s.progress, total: data.total_nodes || 0 },
      }));
      break;

    case 'node_status':
      // Node status update
      const { node_id, status, output, error, processing_time_ms } = data;
      
      setState(s => ({
        ...s,
        nodeStates: {
          ...s.nodeStates,
          [node_id]: {
            status: mapStatus(status),
            progress: status === 'running' ? 50 : status === 'completed' ? 100 : 0,
            output,
            error,
            processingTimeMs: processing_time_ms,
          },
        },
        progress: {
          ...s.progress,
          completed: status === 'completed' || status === 'failed' || status === 'skipped'
            ? s.progress.completed + 1
            : s.progress.completed,
        },
      }));

      onNodeStatusChange?.(node_id, mapStatus(status), output, error);
      break;

    case 'node_progress':
      // Node progress update (for long-running operations)
      const { node_id: progressNodeId, progress, message, logs } = data;
      
      setState(s => ({
        ...s,
        nodeStates: {
          ...s.nodeStates,
          [progressNodeId]: {
            ...s.nodeStates[progressNodeId],
            progress,
          },
        },
      }));
      break;

    case 'complete':
      // Execution completed
      setState(s => ({
        ...s,
        isRunning: false,
        progress: {
          completed: data.completed_nodes || s.progress.completed,
          total: data.total_nodes || s.progress.total,
        },
      }));

      const failedNodes = data.failed_nodes || [];
      
      if (failedNodes.length > 0) {
        toast.warning(`Completed with ${failedNodes.length} failed node(s)`);
      } else {
        toast.success(`Execution completed: ${data.completed_nodes} nodes processed`);
      }

      onComplete?.(data.outputs || {}, failedNodes);
      break;

    case 'error':
      // Execution error
      const errorMessage = data.error || 'Unknown error';
      
      setState(s => ({
        ...s,
        isRunning: false,
        error: errorMessage,
      }));

      toast.error(`Execution failed: ${errorMessage}`);
      break;

    default:
      console.log('[StudioExecution] Unknown event:', event, data);
  }
}

/**
 * Map backend status to frontend status
 */
function mapStatus(backendStatus: string): NodeStatus {
  switch (backendStatus) {
    case 'running': return 'running';
    case 'completed': return 'succeeded';
    case 'succeeded': return 'succeeded';
    case 'failed': return 'failed';
    case 'skipped': return 'skipped';
    case 'pending': return 'queued';
    case 'queued': return 'queued';
    default: return 'idle';
  }
}

export default useStudioExecution;
