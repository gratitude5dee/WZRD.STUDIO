import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useEffect, useRef } from 'react';

interface CanvasGridProps {
  width: number;
  height: number;
  gridSize?: number;
  showGrid?: boolean;
}

export const CanvasGrid = ({ 
  width, 
  height, 
  gridSize = 50, 
  showGrid = true 
}: CanvasGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { viewport } = useCanvasStore();

  useEffect(() => {
    if (!showGrid) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const { x, y, scale } = viewport;
    const scaledGridSize = gridSize * scale;

    // Calculate grid offset
    const offsetX = (x % scaledGridSize + scaledGridSize) % scaledGridSize;
    const offsetY = (y % scaledGridSize + scaledGridSize) % scaledGridSize;

    // More visible grid for dark background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    // Draw vertical lines
    for (let i = offsetX; i < width; i += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = offsetY; i < height; i += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [viewport, width, height, gridSize, showGrid]);

  if (!showGrid) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
