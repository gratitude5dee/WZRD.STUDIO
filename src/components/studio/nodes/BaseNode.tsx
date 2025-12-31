import { CSSProperties, forwardRef, HTMLAttributes, ReactNode } from 'react';
import { Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHandle } from './NodeHandle';
import { DataType, HANDLE_COLORS, HANDLE_GLOW_COLORS } from '@/types/computeFlow';

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  nodeType?: 'text' | 'image' | 'video' | 'audio' | '3d' | 'compute' | 'output';
  isSelected?: boolean;
  handles?: {
    id: string;
    type: 'source' | 'target';
    position: Position;
    dataType?: DataType;
    label?: string;
    maxConnections?: number;
  }[];
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, children, handles = [], nodeType, isSelected = false, ...props }, ref) => {
    const inferredType = (() => {
      if (nodeType) return nodeType;
      if (handles.some(handle => handle.dataType === 'image')) return 'image';
      if (handles.some(handle => handle.dataType === 'video')) return 'video';
      if (handles.some(handle => handle.dataType === 'audio')) return 'audio';
      if (handles.some(handle => handle.dataType === 'text')) return 'text';
      if (handles.some(handle => handle.dataType === 'tensor')) return '3d';
      return 'compute';
    })();

    const nodeColor = (() => {
      switch (inferredType) {
        case 'text':
          return HANDLE_COLORS.text;
        case 'image':
          return HANDLE_COLORS.image;
        case 'video':
          return HANDLE_COLORS.video;
        case 'audio':
          return HANDLE_COLORS.audio;
        case '3d':
          return '#F59E0B';
        case 'output':
          return HANDLE_COLORS.any;
        default:
          return HANDLE_COLORS.any;
      }
    })();

    const nodeGlow = (() => {
      if (inferredType === '3d') {
        return 'rgba(245, 158, 11, 0.4)';
      }
      if (inferredType === 'output') {
        return HANDLE_GLOW_COLORS.any;
      }
      return HANDLE_GLOW_COLORS[inferredType as keyof typeof HANDLE_GLOW_COLORS] || HANDLE_GLOW_COLORS.any;
    })();

    const style = {
      '--node-accent': nodeColor,
      '--node-accent-glow': nodeGlow,
      borderColor: `${nodeColor}40`,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          'group/node relative rounded-2xl border bg-zinc-900/95 text-card-foreground backdrop-blur-xl',
          'min-w-[320px] max-w-[400px]',
          'shadow-[0_2px_4px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.2),0_16px_32px_rgba(0,0,0,0.1)]',
          'transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_16px_32px_rgba(0,0,0,0.25),0_32px_48px_rgba(0,0,0,0.12)]',
          '[.react-flow__node.selected_&]:ring-2',
          '[.react-flow__node.selected_&]:ring-[var(--node-accent)]',
          '[.react-flow__node.selected_&]:shadow-[0_0_0_2px_var(--node-accent),0_0_24px_var(--node-accent-glow)]',
          className
        )}
        style={style}
        {...props}
      >
        {/* Corner indicators for selected state */}
        {isSelected && (
          <>
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[var(--node-accent)]/40 shadow-[0_0_24px_var(--node-accent-glow)] animate-pulse" />
            <div className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-[var(--node-accent)] shadow-[0_0_8px_var(--node-accent-glow)]" />
            <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--node-accent)] shadow-[0_0_8px_var(--node-accent-glow)]" />
            <div className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-[var(--node-accent)] shadow-[0_0_8px_var(--node-accent-glow)]" />
            <div className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--node-accent)] shadow-[0_0_8px_var(--node-accent-glow)]" />
          </>
        )}

        {/* Enhanced handles with labels */}
        {handles.map((handle) => {
          return (
            <NodeHandle key={handle.id} {...handle} />
          );
        })}
        
        {children}
      </div>
    );
  }
);

BaseNode.displayName = 'BaseNode';

export const BaseNodeHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      {...props}
      className={cn(
        'flex min-h-[44px] flex-row items-center justify-between gap-2 border-b border-white/5 bg-zinc-800/80 px-4 py-2',
        'cursor-grab select-none active:cursor-grabbing',
        className
      )}
    />
  )
);
BaseNodeHeader.displayName = 'BaseNodeHeader';

export const BaseNodeHeaderTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('flex-1 select-none text-sm font-semibold text-zinc-100', className)}
    {...props}
  />
));
BaseNodeHeaderTitle.displayName = 'BaseNodeHeaderTitle';

export const BaseNodeContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-y-3 p-4', className)}
      {...props}
    />
  )
);
BaseNodeContent.displayName = 'BaseNodeContent';

export const BaseNodeFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex min-h-[36px] flex-row items-center gap-2 border-t border-white/5 bg-zinc-800/50 px-4 py-2',
        className
      )}
      {...props}
    />
  )
);
BaseNodeFooter.displayName = 'BaseNodeFooter';
