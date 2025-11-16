import { motion } from 'framer-motion';
import type { CanvasObject } from '@/types/canvas';

interface SelectionBoxProps {
  objects: CanvasObject[];
  selectedIds: string[];
  viewport: { x: number; y: number; scale: number };
}

export function SelectionBox({ objects, selectedIds, viewport }: SelectionBoxProps) {
  if (selectedIds.length === 0) return null;

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  
  // Calculate bounding box for all selected objects
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  selectedObjects.forEach(obj => {
    const { x, y, scaleX, scaleY } = obj.transform;
    
    // Calculate object bounds (simplified)
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + (scaleX * 100)); // Approximate width
    maxY = Math.max(maxY, y + (scaleY * 100)); // Approximate height
  });

  const bounds = {
    x: minX * viewport.scale + viewport.x,
    y: minY * viewport.scale + viewport.y,
    width: (maxX - minX) * viewport.scale,
    height: (maxY - minY) * viewport.scale,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {/* Selection border */}
      <div className="absolute inset-0 border-2 border-primary rounded-sm">
        {/* Corner handles */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <div
            key={pos}
            className="absolute w-3 h-3 bg-primary rounded-full border-2 border-background pointer-events-auto cursor-pointer"
            style={{
              ...(pos.includes('t') ? { top: -6 } : { bottom: -6 }),
              ...(pos.includes('l') ? { left: -6 } : { right: -6 }),
            }}
          />
        ))}

        {/* Edge handles */}
        {['t', 'r', 'b', 'l'].map((pos) => (
          <div
            key={pos}
            className="absolute w-3 h-3 bg-primary rounded-full border-2 border-background pointer-events-auto cursor-pointer"
            style={{
              ...(pos === 't' && { top: -6, left: '50%', transform: 'translateX(-50%)' }),
              ...(pos === 'b' && { bottom: -6, left: '50%', transform: 'translateX(-50%)' }),
              ...(pos === 'l' && { left: -6, top: '50%', transform: 'translateY(-50%)' }),
              ...(pos === 'r' && { right: -6, top: '50%', transform: 'translateY(-50%)' }),
            }}
          />
        ))}

        {/* Rotation handle */}
        <div
          className="absolute w-3 h-3 bg-primary rounded-full border-2 border-background pointer-events-auto cursor-pointer"
          style={{
            top: -24,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        <div
          className="absolute w-px h-4 bg-primary"
          style={{
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Selection count badge */}
      {selectedIds.length > 1 && (
        <div className="absolute -top-8 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg">
          {selectedIds.length} selected
        </div>
      )}
    </motion.div>
  );
}
