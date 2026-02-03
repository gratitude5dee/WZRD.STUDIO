import { memo, useMemo, useRef, useEffect, useState } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';
import { TravelingPulse } from './TravelingPulse';

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

// Status-based colors
const STATUS_COLORS: Record<string, string> = {
  idle: 'rgba(255, 255, 255, 0.3)',
  queued: 'rgba(251, 191, 36, 0.8)',
  running: '#00D4FF',
  success: 'rgba(34, 197, 94, 0.8)',
  error: 'rgba(239, 68, 68, 0.8)',
};

interface ImprovedEdgeData {
  dataType?: string;
  status?: 'idle' | 'queued' | 'running' | 'success' | 'error';
  progress?: number;
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
}: EdgeProps) => {
  const edgeData = data as ImprovedEdgeData | undefined;
  const dataType = edgeData?.dataType || 'default';
  const status = edgeData?.status || 'idle';
  const progress = edgeData?.progress ?? 0;
  const isAnimated = edgeData?.animated ?? false;

  // Get colors based on data type and status
  const colors = DATA_TYPE_COLORS[dataType] || DATA_TYPE_COLORS.default;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.idle;

  // Calculate smooth bezier path with better curvature
  const [edgePath] = useMemo(() => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
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
      case 'running':
        return { strokeWidth: 3, glowOpacity: 0.6, animate: true, showPulse: true };
      case 'queued':
        return { strokeWidth: 2.5, glowOpacity: 0.4, animate: true, showPulse: false };
      case 'success':
        return { strokeWidth: 2.5, glowOpacity: 0.5, animate: false, showPulse: false };
      case 'error':
        return { strokeWidth: 2.5, glowOpacity: 0.4, animate: false, showPulse: false };
      default:
        return { strokeWidth: 2.5, glowOpacity: 0.35, animate: isAnimated, showPulse: false };
    }
  }, [status, isAnimated]);

  // Determine stroke color based on status
  const strokeColor = status !== 'idle' ? statusColor : `url(#${gradientId})`;

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
        stroke={status !== 'idle' ? statusColor : colors.glow}
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
        stroke={strokeColor}
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
        stroke={strokeColor}
        fill="none"
        strokeLinecap="round"
        markerEnd={markerEnd as string | undefined}
        style={{
          transition: 'stroke-width 0.3s ease, stroke 0.3s ease',
          // Marching ants for queued status
          ...(status === 'queued' && {
            strokeDasharray: '6, 6',
            animation: 'marching-ants 0.5s linear infinite',
          }),
        }}
      />

      {/* Flow animation overlay */}
      {statusStyles.animate && status !== 'queued' && (
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

      {/* Traveling pulse for running status */}
      {statusStyles.showPulse && (
        <TravelingPulse
          path={edgePath}
          progress={progress}
          color={STATUS_COLORS.running}
          size={8}
          isActive={true}
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

      {/* Success flash effect */}
      {status === 'success' && (
        <path
          d={edgePath}
          strokeWidth={statusStyles.strokeWidth * 2}
          stroke={STATUS_COLORS.success}
          fill="none"
          strokeLinecap="round"
          style={{
            opacity: 0,
            animation: 'edge-success-flash 0.5s ease-out',
          }}
        />
      )}
    </>
  );
});

ImprovedEdge.displayName = 'ImprovedEdge';

export default ImprovedEdge;
