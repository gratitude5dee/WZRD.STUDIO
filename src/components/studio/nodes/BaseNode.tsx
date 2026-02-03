import { CSSProperties, forwardRef, HTMLAttributes, ReactNode, useState, MouseEvent } from 'react';
import { Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Glassmorphic node spawn animation variants
const nodeSpawnVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: 20,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 0.8,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Node hover state variants
const nodeHoverVariants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  active: {
    scale: 0.98,
    y: 1,
  },
};

export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, children, handles = [], nodeType, isSelected = false, hoverMenu, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    
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
      setIsPressed(false);
      onMouseLeave?.(event);
    };

    const currentVariant = isPressed ? 'active' : isHovered ? 'hover' : 'idle';

    return (
      <motion.div
        ref={ref as any}
        className={cn(
          'group/node relative overflow-hidden rounded-xl',
          'min-w-[280px] max-w-[400px]',
          // Glassmorphism styling
          'backdrop-blur-xl',
          'border border-white/[0.08]',
          'transition-[border-color,box-shadow] duration-200 ease-out',
          // Hover states
          'hover:border-white/[0.15]',
          // Selection state
          isSelected && 'ring-1 ring-accent-teal/50 border-accent-teal/30',
          className
        )}
        style={{
          ...style,
          background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(15, 15, 18, 0.9) 100%)',
          boxShadow: isHovered
            ? '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
            : '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          contain: 'layout style paint',
          willChange: 'transform',
        }}
        initial="initial"
        animate={currentVariant}
        variants={nodeHoverVariants}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        {...(props as any)}
      >
        {/* Glass overlay gradient for depth */}
        <div 
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
          }}
        />

        {shouldRenderHoverMenu && hoverMenu && (
          <NodeHoverMenu isVisible={isHovered} {...hoverMenu} />
        )}
        
        {/* Type indicator strip */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
            inferredType === 'image' && 'bg-gradient-to-b from-accent-purple to-accent-purple/50',
            inferredType === 'text' && 'bg-gradient-to-b from-accent-teal to-accent-teal/50',
            inferredType === 'video' && 'bg-gradient-to-b from-accent-amber to-accent-amber/50',
            inferredType === 'audio' && 'bg-gradient-to-b from-accent-teal to-accent-teal/50',
            inferredType === '3d' && 'bg-gradient-to-b from-accent-amber to-accent-amber/50',
            inferredType === 'output' && 'bg-gradient-to-b from-text-tertiary to-text-disabled',
            inferredType === 'compute' && 'bg-gradient-to-b from-accent-purple/60 to-accent-teal/50'
          )}
        />
        
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Selection ring with corner accents */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow border */}
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow: '0 0 24px hsl(var(--glow-teal))',
                  border: '1px solid hsl(var(--accent-teal) / 0.3)',
                }}
              />
              
              {/* Corner dots */}
              <motion.div 
                className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-accent-teal"
                style={{ boxShadow: '0 0 8px hsl(var(--glow-teal))' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-teal"
                style={{ boxShadow: '0 0 8px hsl(var(--glow-teal))' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
              <motion.div 
                className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-accent-teal"
                style={{ boxShadow: '0 0 8px hsl(var(--glow-teal))' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
              <motion.div 
                className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-teal"
                style={{ boxShadow: '0 0 8px hsl(var(--glow-teal))' }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Handles */}
        {handles.map((handle) => {
          return (
            <NodeHandle key={handle.id} {...handle} />
          );
        })}
        
        {children}
      </motion.div>
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
