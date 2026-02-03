import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/lib/stores/canvas-store';

interface UseCanvasInteractionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | HTMLDivElement>;
  onContextMenu?: (x: number, y: number) => void;
}

export function useCanvasInteractions({ canvasRef, onContextMenu }: UseCanvasInteractionsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const { selectedIds, setSelectedIds, viewport, setViewport } = useCanvasStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for canvas shortcuts
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
      }

      // Space key for panning
      if (e.key === ' ' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setContextMenuPos(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && isPanning) {
        setIsPanning(false);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanning, canvasRef, setSelectedIds]);

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - viewport.x) / viewport.scale;
    const y = (e.clientY - rect.top - viewport.y) / viewport.scale;

    // Right click or middle click for panning
    if (e.button === 1 || e.button === 2 || isPanning) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
      return;
    }

    // Context menu
    if (e.button === 2) {
      e.preventDefault();
      onContextMenu?.(e.clientX, e.clientY);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewport({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (canvasRef.current && !isPanning) {
      canvasRef.current.style.cursor = 'default';
    } else if (canvasRef.current && isPanning) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, viewport.scale * delta));

    const scaleRatio = newScale / viewport.scale;
    setViewport({
      scale: newScale,
      x: mouseX - (mouseX - viewport.x) * scaleRatio,
      y: mouseY - (mouseY - viewport.y) * scaleRatio,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e.clientX, e.clientY);
  };

  return {
    isDragging,
    isPanning,
    contextMenuPos,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
      onContextMenu: handleContextMenu,
    },
  };
}
