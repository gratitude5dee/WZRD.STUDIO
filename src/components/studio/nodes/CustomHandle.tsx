import { useEffect } from 'react';
import { Handle, Position, useReactFlow, useStore } from 'reactflow';
import { Port } from '@/types/computeFlow';
import { motion } from 'framer-motion';

interface CustomHandleProps {
  nodeId: string;
  port: Port;
  onChange?: (value: any) => void;
  isVisible: boolean;
}

export function CustomHandle({ nodeId, port, onChange, isVisible }: CustomHandleProps) {
  // Get connections and nodes from React Flow store
  const edges = useStore((state) => state.edges);
  const getNodes = useStore((state) => state.getNodes);
  const nodes = getNodes();
  
  const connections = edges.filter(edge => {
    if (port.type === 'input') {
      return edge.target === nodeId && edge.targetHandle === port.id;
    } else {
      return edge.source === nodeId && edge.sourceHandle === port.id;
    }
  });

  // Reactive data propagation
  useEffect(() => {
    if (port.type === 'input' && onChange && connections.length > 0) {
      const sourceEdge = connections[0];
      const sourceNode = nodes.find(n => n.id === sourceEdge.source);
      
      if (sourceNode?.data) {
        // Extract value from source port
        const sourcePort = sourceNode.data.outputs?.find(
          (p: Port) => p.id === sourceEdge.sourceHandle
        );
        const value = sourcePort?.value ?? sourceNode.data.value;
        
        onChange(value);
      }
    }
  }, [nodes, connections, port.type, onChange]);

  const getHandleColor = () => {
    switch (port.datatype) {
      case 'text/plain': return 'hsl(var(--accent-text))';
      case 'image/*': return 'hsl(var(--accent-image))';
      case 'video/*': return 'hsl(var(--accent-video))';
      default: return 'hsl(var(--border-emphasis))';
    }
  };

  const positionMap: Record<string, Position> = {
    top: Position.Top,
    right: Position.Right,
    bottom: Position.Bottom,
    left: Position.Left,
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isVisible ? 1 : 0.7, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="relative group/handle"
    >
      <Handle
        type={port.type === 'input' ? 'target' : 'source'}
        position={positionMap[port.position]}
        id={port.id}
        className="!w-3.5 !h-3.5 !rounded-full !border-[3px] !border-[hsl(var(--border-subtle))] transition-all duration-200 hover:!scale-140 hover:!border-[hsl(var(--bg-elevated))] hover:!shadow-[0_0_0_4px_rgba(99,102,241,0.2),0_0_20px_rgba(99,102,241,0.4)]"
        style={{ 
          background: getHandleColor(),
          cursor: 'crosshair'
        }}
      />
      
      {/* Handle label tooltip */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: port.position === 'right' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            absolute top-1/2 -translate-y-1/2 
            ${port.position === 'right' ? 'left-full ml-2' : 'right-full mr-2'}
            px-2 py-1 bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-default))] 
            rounded-md text-xs text-[hsl(var(--text-primary))] whitespace-nowrap 
            pointer-events-none z-50 opacity-0 group-hover/handle:opacity-100 transition-opacity
          `}
        >
          <div className="font-medium">{port.name}</div>
          <div className="text-[10px] text-[hsl(var(--text-tertiary))]">{port.datatype}</div>
        </motion.div>
      )}
      
      {/* Connection count badge */}
      {connections.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[hsl(var(--accent-text))] border-2 border-[hsl(var(--bg-card))] rounded-full text-[10px] font-semibold text-white flex items-center justify-center">
          {connections.length}
        </div>
      )}
    </motion.div>
  );
}
