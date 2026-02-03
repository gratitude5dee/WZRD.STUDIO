import { useState, useCallback } from 'react';
import { BlockData, Connection } from '@/types/blockTypes';
import { 
  EdgeDefinition, 
  NodeDefinition, 
  Port, 
  ConnectionValidator,
  DirtyStateTracker,
  EdgeStatus,
  NodeStatus
} from '@/types/computeFlow';

export const useBlockDataFlow = () => {
  const [blockData, setBlockData] = useState<Record<string, BlockData>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [edgeStatuses, setEdgeStatuses] = useState<Record<string, EdgeStatus>>({});
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});

  // Update block output and propagate to connected blocks
  const updateBlockOutput = useCallback((blockId: string, outputId: string, value: any) => {
    setBlockData(prev => {
      const updated = {
        ...prev,
        [blockId]: {
          ...prev[blockId],
          outputs: {
            ...prev[blockId]?.outputs,
            [outputId]: value
          }
        }
      };

      // Find all connections from this output
      const connectedInputs = connections.filter(
        conn => conn.sourceBlockId === blockId && conn.sourcePointId === outputId
      );

      // Propagate data to connected inputs
      connectedInputs.forEach(conn => {
        if (updated[conn.targetBlockId]) {
          updated[conn.targetBlockId] = {
            ...updated[conn.targetBlockId],
            inputs: {
              ...updated[conn.targetBlockId].inputs,
              [conn.targetPointId]: value
            }
          };
        }
      });

      return updated;
    });
  }, [connections]);

  // Get input value for a block from connections
  const getBlockInput = useCallback((blockId: string, inputId: string): any => {
    const block = blockData[blockId];
    return block?.inputs?.[inputId] || null;
  }, [blockData]);

  // Get output value from a block
  const getBlockOutput = useCallback((blockId: string, outputId: string): any => {
    const block = blockData[blockId];
    return block?.outputs?.[outputId] || null;
  }, [blockData]);

  // Validate and add a new connection
  const addConnection = useCallback((
    connection: Connection,
    sourcePort?: Port,
    targetPort?: Port
  ) => {
    setConnections(prev => {
      // Check if connection already exists
      const exists = prev.some(
        c => c.sourceBlockId === connection.sourceBlockId &&
             c.sourcePointId === connection.sourcePointId &&
             c.targetBlockId === connection.targetBlockId &&
             c.targetPointId === connection.targetPointId
      );
      
      if (exists) return prev;

      // Validate connection if ports provided
      if (sourcePort && targetPort) {
        const edgeDefinitions: EdgeDefinition[] = prev.map(c => ({
          id: c.id,
          source: { nodeId: c.sourceBlockId, portId: c.sourcePointId || '' },
          target: { nodeId: c.targetBlockId, portId: c.targetPointId || '' },
          dataType: c.dataType,
          status: 'idle'
        }));

        const validation = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          edgeDefinitions,
          connection.sourceBlockId,
          connection.targetBlockId
        );

        if (!validation.valid) {
          console.error('Connection validation failed:', validation.error);
          return prev;
        }
      }

      const newConnections = [...prev, connection];
      
      // Propagate existing output data to the new connection
      const sourceBlock = blockData[connection.sourceBlockId];
      if (sourceBlock?.outputs?.[connection.sourcePointId || '']) {
        setBlockData(current => ({
          ...current,
          [connection.targetBlockId]: {
            ...current[connection.targetBlockId],
            inputs: {
              ...current[connection.targetBlockId]?.inputs,
              [connection.targetPointId || '']: sourceBlock.outputs[connection.sourcePointId || '']
            }
          }
        }));
      }

      // Mark target node as dirty
      setNodeStatuses(current => ({
        ...current,
        [connection.targetBlockId]: 'dirty'
      }));

      return newConnections;
    });
  }, [blockData]);

  // Remove a connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  }, []);

  // Initialize block data
  const initializeBlock = useCallback((blockId: string, type: 'text' | 'image' | 'video', position: { x: number; y: number }) => {
    setBlockData(prev => ({
      ...prev,
      [blockId]: {
        id: blockId,
        type,
        position,
        inputs: {},
        outputs: {}
      }
    }));
  }, []);

  // Update edge status
  const updateEdgeStatus = useCallback((edgeId: string, status: EdgeStatus) => {
    setEdgeStatuses(prev => ({
      ...prev,
      [edgeId]: status
    }));
  }, []);

  // Update node status
  const updateNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    setNodeStatuses(prev => ({
      ...prev,
      [nodeId]: status
    }));
  }, []);

  // Mark node and downstream as dirty
  const markNodeDirty = useCallback((nodeId: string) => {
    const nodes = Object.values(blockData).map(bd => ({
      id: bd.id,
      kind: bd.type === 'text' ? 'Text' : bd.type === 'image' ? 'Image' : 'Video',
      version: '1.0',
      label: bd.id,
      position: bd.position,
      inputs: [],
      outputs: [],
      params: {},
      status: 'idle' as NodeStatus,
      isDirty: false
    })) as NodeDefinition[];

    const edges = connections.map(c => ({
      id: c.id,
      source: { nodeId: c.sourceBlockId, portId: c.sourcePointId || '' },
      target: { nodeId: c.targetBlockId, portId: c.targetPointId || '' },
      dataType: c.dataType,
      status: 'idle' as EdgeStatus
    }));

    const dirtyNodeIds = DirtyStateTracker.markDirtyDownstream(nodeId, nodes, edges);
    
    setNodeStatuses(current => {
      const updated = { ...current };
      dirtyNodeIds.forEach(id => {
        updated[id] = 'dirty';
      });
      return updated;
    });
  }, [blockData, connections]);

  // Get dirty subgraph for partial execution
  const getDirtySubgraph = useCallback(() => {
    const nodes = Object.values(blockData).map(bd => ({
      id: bd.id,
      kind: bd.type === 'text' ? 'Text' : bd.type === 'image' ? 'Image' : 'Video',
      version: '1.0',
      label: bd.id,
      position: bd.position,
      inputs: [],
      outputs: [],
      params: {},
      status: nodeStatuses[bd.id] || 'idle',
      isDirty: nodeStatuses[bd.id] === 'dirty'
    })) as NodeDefinition[];

    const edges = connections.map(c => ({
      id: c.id,
      source: { nodeId: c.sourceBlockId, portId: c.sourcePointId || '' },
      target: { nodeId: c.targetBlockId, portId: c.targetPointId || '' },
      dataType: c.dataType,
      status: edgeStatuses[c.id] || 'idle'
    }));

    return DirtyStateTracker.computeDirtySubgraph(nodes, edges);
  }, [blockData, connections, nodeStatuses, edgeStatuses]);

  return {
    blockData,
    connections,
    edgeStatuses,
    nodeStatuses,
    updateBlockOutput,
    getBlockInput,
    getBlockOutput,
    addConnection,
    removeConnection,
    initializeBlock,
    setConnections,
    updateEdgeStatus,
    updateNodeStatus,
    markNodeDirty,
    getDirtySubgraph
  };
};
