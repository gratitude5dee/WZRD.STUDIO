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
        case 'text': return 'hsl(217 91% 60%)';
        case 'image': return 'hsl(258 90% 66%)';
        case 'video': return 'hsl(45 90% 60%)';
        default: return 'hsl(var(--muted-foreground))';
      }
    };

    const getNodeGradient = () => {
      // Check if any handle has a specific type to determine node type
      const hasText = handles.some(h => h.dataType === 'text');
      const hasImage = handles.some(h => h.dataType === 'image');
      const hasVideo = handles.some(h => h.dataType === 'video');
      
      if (hasText && !hasImage && !hasVideo) {
        return 'from-blue-500/30 to-purple-500/30';
      }
      if (hasImage) {
        return 'from-purple-500/30 to-pink-500/30';
      }
      if (hasVideo) {
        return 'from-amber-500/30 to-orange-500/30';
      }
      return 'from-zinc-500/20 to-zinc-600/20';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border bg-card text-card-foreground',
          // Sophisticated shadow system
          'shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
          'transition-all duration-300 ease-out',
          // Selected state with blue glow
          '[.react-flow__node.selected_&]:shadow-[0_12px_48px_rgba(59,130,246,0.25)]',
          '[.react-flow__node.selected_&]:ring-2 [.react-flow__node.selected_&]:ring-blue-500/50',
          className
        )}
        {...props}
      >
        {/* Gradient border overlay */}
        <div 
          className={cn(
            'absolute inset-0 rounded-xl bg-gradient-to-br opacity-20 pointer-events-none',
            'transition-opacity duration-300',
            '[.react-flow__node.selected_&]:opacity-40',
            getNodeGradient()
          )}
          style={{ maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)', WebkitMaskComposite: 'xor' }}
        />
        
        {/* Corner indicators for selected state */}
        <div className="[.react-flow__node.selected_&]:block hidden">
          <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </div>
        {/* Enhanced handles with labels */}
        {handles.map((handle) => {
          const color = getDataTypeColor(handle.dataType);
          return (
            <div key={handle.id} className="group/handle relative">
              <Handle
                id={handle.id}
                type={handle.type}
                position={handle.position}
                className={cn(
                  'w-5 h-5 border-[3px] bg-background transition-all cursor-pointer',
                  'hover:scale-[2] hover:shadow-2xl hover:z-50',
                  'active:scale-[1.8]',
                  // Pulse animation on hover
                  'hover:animate-pulse'
                )}
                style={{
                  borderColor: color,
                  boxShadow: `0 0 12px ${color}60, 0 0 4px ${color}40`,
                }}
              />
              
              {/* Handle label tooltip */}
              {handle.label && (
                <div 
                  className={cn(
                    'absolute opacity-0 group-hover/handle:opacity-100 transition-opacity',
                    'pointer-events-none z-50 whitespace-nowrap',
                    'px-2 py-1 text-[10px] font-medium rounded-md',
                    'bg-zinc-900 border border-zinc-700 shadow-xl',
                    handle.position === 'left' && 'left-full ml-2 top-1/2 -translate-y-1/2',
                    handle.position === 'right' && 'right-full mr-2 top-1/2 -translate-y-1/2',
                    handle.position === 'top' && 'top-full mt-2 left-1/2 -translate-x-1/2',
                    handle.position === 'bottom' && 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                  )}
                  style={{ color }}
                >
                  {handle.label}
                  {handle.dataType && (
                    <span className="ml-1 text-zinc-500">({handle.dataType})</span>
                  )}
                </div>
              )}
            </div>
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
