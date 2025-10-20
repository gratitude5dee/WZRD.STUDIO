import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  handles?: {
    id: string;
    type: 'source' | 'target';
    position: Position;
    dataType?: 'text' | 'image' | 'video' | 'any';
    label?: string;
    maxConnections?: number;
  }[];
}

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, children, handles = [], ...props }, ref) => {
    const getDataTypeColor = (dataType?: string) => {
      switch (dataType) {
        case 'text': return 'hsl(var(--chart-1))';
        case 'image': return 'hsl(var(--chart-2))';
        case 'video': return 'hsl(var(--chart-3))';
        default: return 'hsl(var(--muted-foreground))';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border bg-card text-card-foreground shadow-lg',
          'hover:shadow-xl transition-all duration-200',
          '[.react-flow__node.selected_&]:border-primary [.react-flow__node.selected_&]:shadow-2xl',
          className
        )}
        {...props}
      >
        {/* Render handles */}
        {handles.map((handle) => (
          <Handle
            key={handle.id}
            id={handle.id}
            type={handle.type}
            position={handle.position}
            className={cn(
              'w-3 h-3 border-2 bg-background transition-all',
              'hover:scale-150 hover:shadow-lg'
            )}
            style={{
              borderColor: getDataTypeColor(handle.dataType),
            }}
          />
        ))}
        
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
        'flex flex-row items-center justify-between gap-2 px-3 py-2 border-b',
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
    className={cn('select-none flex-1 font-semibold text-sm', className)}
    {...props}
  />
));
BaseNodeHeaderTitle.displayName = 'BaseNodeHeaderTitle';

export const BaseNodeContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-y-2 p-3', className)}
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
        'flex flex-row items-center gap-2 border-t px-3 py-2',
        className
      )}
      {...props}
    />
  )
);
BaseNodeFooter.displayName = 'BaseNodeFooter';
