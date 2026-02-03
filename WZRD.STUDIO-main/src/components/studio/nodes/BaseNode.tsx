import { CSSProperties, forwardRef, HTMLAttributes, ReactNode, useState, MouseEvent } from 'react';
import { Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHandle } from './NodeHandle';
import { DataType, HANDLE_COLORS, HANDLE_GLOW_COLORS } from '@/types/computeFlow';
import { NodeHoverMenu, NodeHoverMenuProps } from './NodeHoverMenu';

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  nodeType?: 'text' | 'image' | 'video' | 'audio' | '3d' | 'compute' | 'output';
  isSelected?: boolean;
  hoverMenu?: Omit<NodeHoverMenuProps, 'isVisible'>;
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
  ({ className, children, handles = [], nodeType, isSelected = false, hoverMenu, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
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
    } as CSSProperties;

    const shouldRenderHoverMenu = Boolean(
      hoverMenu && (
        hoverMenu.onGenerate ||
        hoverMenu.onDuplicate ||
        hoverMenu.onDelete ||
        (hoverMenu.onModelChange && hoverMenu.modelOptions?.length)
      )
    );

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(event);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group/node relative overflow-hidden rounded-2xl border border-border-default bg-surface-2 text-text-primary',
          'min-w-[280px] max-w-[400px]',
          'shadow-lg shadow-black/20',
          'transition-all duration-200 ease-out',
          'hover:border-border-strong hover:shadow-xl hover:shadow-black/30',
          isSelected && 'ring-2 ring-accent-teal/50 border-accent-teal/30',
          className
        )}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {shouldRenderHoverMenu && hoverMenu && (
          <NodeHoverMenu isVisible={isHovered} {...hoverMenu} />
        )}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl',
            inferredType === 'image' && 'bg-gradient-to-b from-accent-purple to-accent-purple/50',
            inferredType === 'text' && 'bg-gradient-to-b from-accent-teal to-accent-teal/50',
            inferredType === 'video' && 'bg-gradient-to-b from-accent-amber to-accent-amber/50',
            inferredType === 'audio' && 'bg-gradient-to-b from-accent-teal to-accent-teal/50',
            inferredType === '3d' && 'bg-gradient-to-b from-accent-amber to-accent-amber/50',
            inferredType === 'output' && 'bg-gradient-to-b from-text-tertiary to-text-disabled',
            inferredType === 'compute' && 'bg-gradient-to-b from-accent-purple/60 to-accent-teal/50'
          )}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Corner indicators for selected state */}
        {isSelected && (
          <>
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-accent-teal/30 shadow-[0_0_24px_hsl(var(--glow-teal))] animate-pulse-subtle" />
            <div className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_8px_hsl(var(--glow-teal))]" />
            <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_8px_hsl(var(--glow-teal))]" />
            <div className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_8px_hsl(var(--glow-teal))]" />
            <div className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_8px_hsl(var(--glow-teal))]" />
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
        'flex min-h-[44px] flex-row items-center justify-between gap-2 border-b border-border-subtle bg-surface-2 px-4 py-2',
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
    className={cn('flex-1 select-none text-sm font-semibold text-text-primary', className)}
    {...props}
  />
));
BaseNodeHeaderTitle.displayName = 'BaseNodeHeaderTitle';

export const BaseNodeContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-y-3 p-4 text-text-secondary', className)}
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
        'flex min-h-[36px] flex-row items-center gap-2 border-t border-border-subtle bg-surface-2/80 px-4 py-2 text-text-secondary',
        className
      )}
      {...props}
    />
  )
);
BaseNodeFooter.displayName = 'BaseNodeFooter';
