import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useEffect, useRef } from 'react';

interface MiniMapProps {
  width?: number;
  height?: number;
}

export const MiniMap = ({ width = 200, height = 150 }: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { objects, viewport } = useCanvasStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, width, height);

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    objects.forEach(obj => {
      const { x, y, scaleX, scaleY } = obj.transform;
      const w = ((obj.data as any).width || 100) * scaleX;
      const h = ((obj.data as any).height || 100) * scaleY;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    // Add viewport bounds
    const vpWidth = width / viewport.scale;
    const vpHeight = height / viewport.scale;
    minX = Math.min(minX, -viewport.x / viewport.scale);
    minY = Math.min(minY, -viewport.y / viewport.scale);
    maxX = Math.max(maxX, (-viewport.x + vpWidth) / viewport.scale);
    maxY = Math.max(maxY, (-viewport.y + vpHeight) / viewport.scale);

    const canvasWidth = maxX - minX || width;
    const canvasHeight = maxY - minY || height;
    const scale = Math.min(width / canvasWidth, height / canvasHeight) * 0.9;

    // Draw objects
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
    ctx.translate(-minX, -minY);

    objects.forEach(obj => {
      const { x, y, scaleX, scaleY } = obj.transform;
      const w = ((obj.data as any).width || 100) * scaleX;
      const h = ((obj.data as any).height || 100) * scaleY;

      if (obj.type === 'image' || obj.type === 'video') {
        ctx.fillStyle = 'hsl(var(--primary))';
      } else if (obj.type === 'text') {
        ctx.fillStyle = 'hsl(var(--accent))';
      } else {
        ctx.fillStyle = 'hsl(var(--muted))';
      }
      
      ctx.fillRect(x, y, w, h);
    });

    // Draw viewport indicator
    const vpX = -viewport.x / viewport.scale;
    const vpY = -viewport.y / viewport.scale;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(vpX, vpY, vpWidth, vpHeight);

    ctx.restore();
  }, [objects, viewport, width, height]);

  return (
    <div className="absolute top-4 right-4 z-40">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-border/30 rounded-lg bg-[#0A0A0A]/80 backdrop-blur-xl shadow-lg"
      />
    </div>
  );
};
