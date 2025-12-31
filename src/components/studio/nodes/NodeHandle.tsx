import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { DataType, HANDLE_COLORS, HANDLE_GLOW_COLORS } from '@/types/computeFlow';
import { useState } from 'react';

interface NodeHandleProps {
  id: string;
  type: 'source' | 'target';
  position: Position;
  dataType?: DataType;
  label?: string;
  maxConnections?: number;
  className?: string;
}

export const NodeHandle = ({
  id,
  type,
  position,
  dataType = 'any',
  label,
  className,
}: NodeHandleProps) => {
  const color = HANDLE_COLORS[dataType];
  const glow = HANDLE_GLOW_COLORS[dataType];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group/handle relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible enlarged hitbox - 32x32px for easy clicking */}
      <div 
        className="absolute -inset-3 z-10 cursor-crosshair" 
        aria-hidden="true"
      />
      
      <Handle
        id={id}
        type={type}
        position={position}
        className={cn(
          'relative flex h-4 w-4 items-center justify-center rounded-full border-2 bg-zinc-950/90',
          'transition-all duration-150 ease-out',
          'hover:scale-125 hover:shadow-[0_0_16px_var(--handle-glow)]',
          'active:scale-150',
          isHovered && 'scale-125',
          className
        )}
        style={{
          borderColor: color,
          boxShadow: isHovered 
            ? `0 0 16px ${glow}, 0 0 4px ${glow}` 
            : `0 0 8px ${glow}, 0 0 2px ${glow}`,
          ['--handle-glow' as string]: glow,
        }}
        aria-label={`${dataType} ${type} port`}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-transform duration-150",
            isHovered && "scale-125"
          )}
          style={{ backgroundColor: color }}
        />
      </Handle>

      {label && (
        <div
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-950/90 px-2 py-1 text-[10px] font-medium text-zinc-200 shadow-lg',
            'opacity-0 transition-opacity duration-150 group-hover/handle:opacity-100 group-hover/node:opacity-100',
            isHovered && 'opacity-100',
            position === Position.Left && 'left-full ml-2 top-1/2 -translate-y-1/2',
            position === Position.Right && 'right-full mr-2 top-1/2 -translate-y-1/2',
            position === Position.Top && 'top-full mt-2 left-1/2 -translate-x-1/2',
            position === Position.Bottom && 'bottom-full mb-2 left-1/2 -translate-x-1/2'
          )}
        >
          <span style={{ color }}>{label}</span>
          {dataType !== 'any' && (
            <span className="ml-1 text-zinc-500">({dataType})</span>
          )}
        </div>
      )}
    </div>
  );
};
