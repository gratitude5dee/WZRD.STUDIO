import { memo } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type EdgeStatus = 'idle' | 'active' | 'success' | 'error';

export interface EnhancedEdgeData {
  status?: EdgeStatus;
  label?: string;
  dataType?: 'text' | 'image' | 'video' | 'any';
}

export const EnhancedStudioEdge = memo(({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected
}: EdgeProps) => {
  const edgeData = data as EnhancedEdgeData | undefined;
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const status = edgeData?.status || 'idle';
  const dataType = edgeData?.dataType || 'any';

  const getDataTypeColor = () => {
    switch (dataType) {
      case 'text': return { stroke: 'hsl(217 91% 60%)', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'image': return { stroke: 'hsl(258 90% 66%)', glow: 'rgba(139, 92, 246, 0.4)' };
      case 'video': return { stroke: 'hsl(45 90% 60%)', glow: 'rgba(251, 191, 36, 0.4)' };
      default: return { stroke: 'hsl(var(--muted-foreground))', glow: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const getStatusStyle = () => {
    const color = getDataTypeColor();
    
    switch (status) {
      case 'active':
        return {
          strokeWidth: 3,
          stroke: color.stroke,
          strokeDasharray: '8 4',
          animation: 'dash 0.5s linear infinite',
          glow: color.glow,
        };
      case 'success':
        return {
          strokeWidth: 3,
          stroke: 'hsl(142 76% 56%)',
          strokeDasharray: '0',
          glow: 'rgba(34, 197, 94, 0.5)',
          pulse: true,
        };
      case 'error':
        return {
          strokeWidth: 3,
          stroke: 'hsl(0 84% 60%)',
          strokeDasharray: '4 4',
          glow: 'rgba(239, 68, 68, 0.5)',
        };
      default:
        return {
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? color.stroke : `${color.stroke}80`,
          strokeDasharray: '0',
          glow: selected ? color.glow : `${color.glow}60`,
        };
    }
  };

  const style = getStatusStyle();

  return (
    <>
      <defs>
        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Gradient for flow animation */}
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={style.stroke} stopOpacity="0" />
          <stop offset="50%" stopColor={style.stroke} stopOpacity="1" />
          <stop offset="100%" stopColor={style.stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <path
        id={`${id}-glow`}
        d={edgePath}
        fill="none"
        stroke={style.glow}
        strokeWidth={style.strokeWidth * 3}
        strokeOpacity={0.3}
        style={{ filter: 'blur(6px)' }}
        className={cn(
          'pointer-events-none transition-all duration-300',
          selected && 'opacity-100',
          !selected && 'opacity-60'
        )}
      />

      {/* Main edge path */}
      <path
        id={String(id)}
        d={edgePath}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        className={cn(
          'transition-all duration-300',
          status === 'active' && 'animate-[dash_0.5s_linear_infinite]',
          style.pulse && 'animate-pulse'
        )}
        style={{ filter: `url(#glow-${String(id)})` }}
      />

      {/* Animated particles for active edges */}
      {status === 'active' && (
        <>
          <motion.circle
            r="3"
            fill={style.stroke}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              offsetPath: `path('${edgePath}')`,
              offsetRotate: '0deg'
            }}
          >
            <animateMotion
              dur="1.5s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
          
          <motion.circle
            r="3"
            fill={style.stroke}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.5
            }}
            style={{
              offsetPath: `path('${edgePath}')`,
              offsetRotate: '0deg'
            }}
          >
            <animateMotion
              dur="1.5s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
        </>
      )}

      {/* Connection dots at endpoints */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={4}
        fill={style.stroke}
        className="transition-all duration-300"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={4}
        fill={style.stroke}
        className="transition-all duration-300"
      />

      {/* Edge label */}
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <div className={cn(
              'px-2 py-1 text-[10px] font-medium rounded-md backdrop-blur-sm',
              'bg-zinc-900/90 border shadow-lg',
              'transition-all duration-300',
              selected && 'border-blue-500/50 shadow-blue-500/20',
              !selected && 'border-zinc-700/50'
            )}>
              {edgeData.label}
            </div>
          </motion.div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

EnhancedStudioEdge.displayName = 'EnhancedStudioEdge';
