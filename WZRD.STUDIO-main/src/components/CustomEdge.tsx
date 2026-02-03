import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { EdgeStatus } from '@/types/computeFlow';

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    curvature: 0.8,
  });

  const status: EdgeStatus = data?.status || 'idle';
  const isRunning = status === 'running';
  const isError = status === 'error';
  const isSuccess = status === 'succeeded';

  const getStatusColor = () => {
    if (isError) return '#ef4444';
    if (isSuccess) return '#10b981';
    if (isRunning) return '#3b82f6';
    return data?.color || '#52525b';
  };

  const strokeColor = getStatusColor();

  return (
    <>
      {/* Glow effect for edges */}
      <BaseEdge 
        path={edgePath}
        style={{
          strokeWidth: 10,
          stroke: strokeColor,
          opacity: 0.15,
          filter: 'blur(4px)',
        }}
      />
      
      {/* Main edge path */}
      <BaseEdge 
        path={edgePath}
        style={{
          ...style,
          strokeWidth: isRunning ? 3.5 : 3,
          stroke: strokeColor,
          strokeDasharray: isRunning ? '10 5' : data?.dashed ? '5,5' : 'none',
          opacity: 0.9,
        }}
      />

      {/* Connection dots at endpoints */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={4}
        fill={strokeColor}
        opacity={0.8}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={4}
        fill={strokeColor}
        opacity={0.8}
      />

      {/* Animated flow particles when running */}
      {isRunning && (
        <>
          <circle r="3" fill={strokeColor}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          <circle r="2" fill={strokeColor} opacity="0.6">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
              begin="0.5s"
            />
          </circle>
        </>
      )}

      {/* Success flash */}
      {isSuccess && (
        <animate
          attributeName="opacity"
          values="1;0"
          dur="0.8s"
          fill="freeze"
        />
      )}
    </>
  );
};

export default CustomEdge;
