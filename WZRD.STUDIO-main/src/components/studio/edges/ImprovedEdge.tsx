import { memo, useMemo } from 'react';
import { EdgeProps, getBezierPath, getSmoothStepPath, Position } from '@xyflow/react';

// Data type color mapping for intuitive visual connections
const DATA_TYPE_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  text: { primary: '#3B82F6', secondary: '#60A5FA', glow: 'rgba(59, 130, 246, 0.4)' },
  image: { primary: '#10B981', secondary: '#34D399', glow: 'rgba(16, 185, 129, 0.4)' },
  video: { primary: '#8B5CF6', secondary: '#A78BFA', glow: 'rgba(139, 92, 246, 0.4)' },
  audio: { primary: '#EC4899', secondary: '#F472B6', glow: 'rgba(236, 72, 153, 0.4)' },
  tensor: { primary: '#F59E0B', secondary: '#FBBF24', glow: 'rgba(245, 158, 11, 0.4)' },
  json: { primary: '#6366F1', secondary: '#818CF8', glow: 'rgba(99, 102, 241, 0.4)' },
  any: { primary: '#6B7280', secondary: '#9CA3AF', glow: 'rgba(107, 114, 128, 0.4)' },
  default: { primary: '#8B5CF6', secondary: '#22D3EE', glow: 'rgba(139, 92, 246, 0.3)' },
};

interface ImprovedEdgeData {
  dataType?: string;
  status?: 'idle' | 'active' | 'success' | 'error';
  animated?: boolean;
}

export const ImprovedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected,
}: EdgeProps<ImprovedEdgeData>) => {
  const dataType = (data?.dataType as string) || 'default';
  const status = data?.status || 'idle';
  const isAnimated = data?.animated ?? false;

  // Get colors based on data type
  const colors = DATA_TYPE_COLORS[dataType] || DATA_TYPE_COLORS.default;

  // Calculate smooth bezier path with better curvature
  const [edgePath, labelX, labelY] = useMemo(() => {
    // Calculate distance for dynamic curvature
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Adjust curvature based on distance for more natural curves
    const curvature = Math.min(0.5, Math.max(0.2, distance / 500));

    return getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      curvature,
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const gradientId = `improved-edge-gradient-${id}`;
  const glowId = `improved-edge-glow-${id}`;
  const flowAnimationId = `improved-edge-flow-${id}`;

  // Status-based styling
  const statusStyles = useMemo(() => {
    switch (status) {
      case 'active':
        return { strokeWidth: 3, glowOpacity: 0.5, animate: true };
      case 'success':
        return { strokeWidth: 2.5, glowOpacity: 0.4, animate: false };
      case 'error':
        return { strokeWidth: 2.5, glowOpacity: 0.3, animate: false };
      default:
        return { strokeWidth: 2.5, glowOpacity: 0.35, animate: isAnimated };
    }
  }, [status, isAnimated]);

  return (
    <>
      <defs>
        {/* Gradient for edge color */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="50%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Flow animation gradient */}
        {statusStyles.animate && (
          <linearGradient id={flowAnimationId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent">
              <animate attributeName="offset" values="-0.3;1" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="15%" stopColor="white" stopOpacity="0.8">
              <animate attributeName="offset" values="-0.15;1.15" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stopColor="transparent">
              <animate attributeName="offset" values="0;1.3" dur="1.5s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}
      </defs>

      {/* Outer glow layer */}
      <path
        id={`${id}-outer-glow`}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={16}
        stroke={colors.glow}
        fill="none"
        style={{
          opacity: selected ? 0.5 : statusStyles.glowOpacity * 0.5,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Inner glow layer */}
      <path
        id={`${id}-glow`}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={10}
        stroke={`url(#${gradientId})`}
        fill="none"
        filter={`url(#${glowId})`}
        style={{
          opacity: selected ? 0.6 : statusStyles.glowOpacity,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Main edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={statusStyles.strokeWidth}
        stroke={`url(#${gradientId})`}
        fill="none"
        strokeLinecap="round"
        markerEnd={markerEnd}
        style={{
          transition: 'stroke-width 0.3s ease',
        }}
      />

      {/* Flow animation overlay */}
      {statusStyles.animate && (
        <path
          d={edgePath}
          strokeWidth={statusStyles.strokeWidth + 1}
          stroke={`url(#${flowAnimationId})`}
          fill="none"
          strokeLinecap="round"
          style={{
            mixBlendMode: 'overlay',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Selected state highlight */}
      {selected && (
        <path
          d={edgePath}
          strokeWidth={statusStyles.strokeWidth + 4}
          stroke={colors.primary}
          fill="none"
          strokeLinecap="round"
          style={{
            opacity: 0.3,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </>
  );
});

ImprovedEdge.displayName = 'ImprovedEdge';

export default ImprovedEdge;
