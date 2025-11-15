import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface DragMonitor {
  isDragging: () => boolean;
  getDifferenceFromInitialOffset: () => { x: number; y: number } | null;
}

interface DragSpec<Item, Collected> {
  type: string;
  item: Item;
  collect?: (monitor: DragMonitor) => Collected;
  end?: (item: Item, monitor: DragMonitor) => void;
}

function defaultCollect(monitor: DragMonitor) {
  return {
    isDragging: monitor.isDragging(),
  } as { isDragging: boolean };
}

export function useDrag<Item = unknown, Collected = { isDragging: boolean }>(
  spec: DragSpec<Item, Collected>
): [Collected, (node: HTMLElement | null) => void] {
  const nodeRef = useRef<HTMLElement | null>(null);
  const startOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const diffRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const specRef = useRef(spec);

  specRef.current = spec;

  const monitor: DragMonitor = useMemo(
    () => ({
      isDragging: () => isDragging,
      getDifferenceFromInitialOffset: () => diffRef.current,
    }),
    [isDragging]
  );

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!startOffsetRef.current) return;
    diffRef.current = {
      x: event.clientX - startOffsetRef.current.x,
      y: event.clientY - startOffsetRef.current.y,
    };
    setIsDragging(true);
  }, []);

  const finalizeDrag = useCallback(() => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', finalizeDrag);
    document.removeEventListener('pointercancel', finalizeDrag);
    if (!startOffsetRef.current) return;
    const currentSpec = specRef.current;
    setIsDragging(false);
    currentSpec.end?.(currentSpec.item, monitor);
    startOffsetRef.current = null;
  }, [handlePointerMove, monitor]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (event.button !== 0) return;
      startOffsetRef.current = { x: event.clientX, y: event.clientY };
      diffRef.current = { x: 0, y: 0 };
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', finalizeDrag);
      document.addEventListener('pointercancel', finalizeDrag);
    },
    [finalizeDrag, handlePointerMove]
  );

  const cleanup = useCallback(() => {
    nodeRef.current?.removeEventListener('pointerdown', handlePointerDown);
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', finalizeDrag);
    document.removeEventListener('pointercancel', finalizeDrag);
  }, [finalizeDrag, handlePointerDown, handlePointerMove]);

  useEffect(() => cleanup, [cleanup]);

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('pointerdown', handlePointerDown);
      }
      nodeRef.current = node;
      if (node) {
        node.addEventListener('pointerdown', handlePointerDown);
      }
    },
    [handlePointerDown]
  );

  const collected = useMemo(() => {
    return spec.collect ? spec.collect(monitor) : (defaultCollect(monitor) as Collected);
  }, [monitor, spec.collect]);

  return [collected, setNodeRef];
}

export const DndProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
