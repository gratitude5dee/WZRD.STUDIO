import { useState, useCallback } from 'react';

export type ConnectionMode = 'drag' | 'click';

interface ConnectionState {
  mode: ConnectionMode;
  sourceNode: string | null;
  sourceHandle: string | null;
}

export const useConnectionMode = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    mode: 'drag',
    sourceNode: null,
    sourceHandle: null,
  });

  const startClickConnection = useCallback((nodeId: string, handleId: string) => {
    setConnectionState({
      mode: 'click',
      sourceNode: nodeId,
      sourceHandle: handleId,
    });
  }, []);

  const completeClickConnection = useCallback((targetNodeId: string, targetHandleId: string) => {
    const connection = {
      source: connectionState.sourceNode!,
      sourceHandle: connectionState.sourceHandle,
      target: targetNodeId,
      targetHandle: targetHandleId,
    };
    
    // Reset state
    setConnectionState({
      mode: 'drag',
      sourceNode: null,
      sourceHandle: null,
    });
    
    return connection;
  }, [connectionState]);

  const cancelClickConnection = useCallback(() => {
    setConnectionState({
      mode: 'drag',
      sourceNode: null,
      sourceHandle: null,
    });
  }, []);

  const toggleMode = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      mode: prev.mode === 'drag' ? 'click' : 'drag',
    }));
  }, []);

  return {
    connectionState,
    isClickMode: connectionState.mode === 'click',
    isConnecting: connectionState.sourceNode !== null,
    startClickConnection,
    completeClickConnection,
    cancelClickConnection,
    toggleMode,
  };
};
