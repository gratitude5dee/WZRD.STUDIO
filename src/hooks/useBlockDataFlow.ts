import { useState, useCallback } from 'react';
import { BlockData, Connection } from '@/types/blockTypes';

export const useBlockDataFlow = () => {
  const [blockData, setBlockData] = useState<Record<string, BlockData>>({});
  const [connections, setConnections] = useState<Connection[]>([]);

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

  // Add a new connection
  const addConnection = useCallback((connection: Connection) => {
    setConnections(prev => {
      // Check if connection already exists
      const exists = prev.some(
        c => c.sourceBlockId === connection.sourceBlockId &&
             c.sourcePointId === connection.sourcePointId &&
             c.targetBlockId === connection.targetBlockId &&
             c.targetPointId === connection.targetPointId
      );
      
      if (exists) return prev;

      const newConnections = [...prev, connection];
      
      // Propagate existing output data to the new connection
      const sourceBlock = blockData[connection.sourceBlockId];
      if (sourceBlock?.outputs?.[connection.sourcePointId]) {
        setBlockData(current => ({
          ...current,
          [connection.targetBlockId]: {
            ...current[connection.targetBlockId],
            inputs: {
              ...current[connection.targetBlockId]?.inputs,
              [connection.targetPointId]: sourceBlock.outputs[connection.sourcePointId]
            }
          }
        }));
      }

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

  return {
    blockData,
    connections,
    updateBlockOutput,
    getBlockInput,
    getBlockOutput,
    addConnection,
    removeConnection,
    initializeBlock,
    setConnections
  };
};
