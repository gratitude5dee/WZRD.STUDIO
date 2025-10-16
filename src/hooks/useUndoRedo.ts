import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export const useUndoRedo = (initialNodes: Node[], initialEdges: Edge[]) => {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ nodes, edges });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { takeSnapshot, undo, redo, canUndo, canRedo };
};
