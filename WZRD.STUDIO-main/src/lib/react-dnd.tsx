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

  const handleDragStart = useCallback((e: DragEvent) => {
    e.dataTransfer!.effectAllowed = 'copy';
    e.dataTransfer!.setData('application/json', JSON.stringify(specRef.current.item));
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const currentSpec = specRef.current;
    currentSpec.end?.(currentSpec.item, monitor);
  }, [monitor]);

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
        nodeRef.current.removeEventListener('dragstart', handleDragStart as any);
        nodeRef.current.removeEventListener('dragend', handleDragEnd as any);
      }
      nodeRef.current = node;
      if (node) {
        node.draggable = true;
        node.addEventListener('pointerdown', handlePointerDown);
        node.addEventListener('dragstart', handleDragStart as any);
        node.addEventListener('dragend', handleDragEnd as any);
      }
    },
    [handlePointerDown, handleDragStart, handleDragEnd]
  );

  const collected = useMemo(() => {
    return spec.collect ? spec.collect(monitor) : (defaultCollect(monitor) as Collected);
  }, [monitor, spec.collect]);

  return [collected, setNodeRef];
}

interface DropMonitor {
  isOver: () => boolean;
  canDrop: () => boolean;
  getItem: () => any;
  getClientOffset: () => { x: number; y: number } | null;
}

interface DropSpec<Item, Collected> {
  accept: string | string[];
  drop?: (item: Item, monitor: DropMonitor) => void;
  canDrop?: (item: Item) => boolean;
  collect?: (monitor: DropMonitor) => Collected;
  hover?: (item: Item, monitor: DropMonitor) => void;
}

function defaultDropCollect(monitor: DropMonitor) {
  return {
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  } as { isOver: boolean; canDrop: boolean };
}

export function useDrop<Item = unknown, Collected = { isOver: boolean; canDrop: boolean }>(
  spec: DropSpec<Item, Collected>
): [Collected, (node: HTMLElement | null) => void] {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [dragItem, setDragItem] = useState<Item | null>(null);
  const specRef = useRef(spec);

  specRef.current = spec;

  const monitor: DropMonitor = useMemo(
    () => ({
      isOver: () => isOver,
      canDrop: () => {
        if (!dragItem) return false;
        return specRef.current.canDrop ? specRef.current.canDrop(dragItem) : true;
      },
      getItem: () => dragItem,
      getClientOffset: () => {
        // This would be set during drag events
        return null;
      },
    }),
    [isOver, dragItem]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    setIsOver(true);
    
    if (dragItem && specRef.current.hover) {
      specRef.current.hover(dragItem, monitor);
    }
  }, [dragItem, monitor]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer?.getData('application/json');
      if (data) {
        const item = JSON.parse(data);
        setDragItem(item);
      }
    } catch (err) {
      // Ignore parse errors
    }
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // Only set isOver to false if we're actually leaving the element
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      const isOutside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
      if (isOutside) {
        setIsOver(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsOver(false);

    try {
      const data = e.dataTransfer?.getData('application/json');
      if (data) {
        const item = JSON.parse(data) as Item;
        const customMonitor: DropMonitor = {
          ...monitor,
          getClientOffset: () => ({ x: e.clientX, y: e.clientY }),
        };
        
        if (specRef.current.drop) {
          specRef.current.drop(item, customMonitor);
        }
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
    
    setDragItem(null);
  }, [monitor]);

  const cleanup = useCallback(() => {
    nodeRef.current?.removeEventListener('dragover', handleDragOver as any);
    nodeRef.current?.removeEventListener('dragenter', handleDragEnter as any);
    nodeRef.current?.removeEventListener('dragleave', handleDragLeave as any);
    nodeRef.current?.removeEventListener('drop', handleDrop as any);
  }, [handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  useEffect(() => cleanup, [cleanup]);

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      if (nodeRef.current) {
        cleanup();
      }
      nodeRef.current = node;
      if (node) {
        node.addEventListener('dragover', handleDragOver as any);
        node.addEventListener('dragenter', handleDragEnter as any);
        node.addEventListener('dragleave', handleDragLeave as any);
        node.addEventListener('drop', handleDrop as any);
      }
    },
    [cleanup, handleDragOver, handleDragEnter, handleDragLeave, handleDrop]
  );

  const collected = useMemo(() => {
    return spec.collect ? spec.collect(monitor) : (defaultDropCollect(monitor) as Collected);
  }, [monitor, spec.collect]);

  return [collected, setNodeRef];
}

export const DndProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
