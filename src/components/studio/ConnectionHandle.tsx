import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Port, DataType } from '@/types/computeFlow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionHandleProps {
  port: Port;
  nodeId: string;
  isConnected: boolean;
  isValidTarget?: boolean;
  onStartConnection?: (nodeId: string, portId: string, e: React.MouseEvent) => void;
  onFinishConnection?: (nodeId: string, portId: string) => void;
}

export const ConnectionHandle: React.FC<ConnectionHandleProps> = ({
  port,
  nodeId,
  isConnected,
  isValidTarget = false,
  onStartConnection,
  onFinishConnection
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isInput = port.position === 'left' || port.position === 'top';
  const isOutput = port.position === 'right' || port.position === 'bottom';

  const getDataTypeColor = (datatype: DataType) => {
    switch (datatype) {
      case 'image': return '#8b5cf6'; // purple
      case 'text': return '#3b82f6'; // blue
      case 'video': return '#f59e0b'; // amber
      case 'tensor': return '#10b981'; // green
      case 'json': return '#6366f1'; // indigo
      case 'any': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const color = getDataTypeColor(port.datatype);

  const handleSize = isHovered || isConnected ? 12 : 8;
  const handlePosition = {
    left: { left: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' },
    right: { right: -handleSize / 2, top: '50%', transform: 'translateY(-50%)' },
    top: { top: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -handleSize / 2, left: '50%', transform: 'translateX(-50%)' }
  }[port.position];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="absolute cursor-pointer z-10"
            style={handlePosition}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (isOutput && onStartConnection) {
                onStartConnection(nodeId, port.id, e);
              }
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              if (isInput && onFinishConnection) {
                onFinishConnection(nodeId, port.id);
              }
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Handle Circle */}
            <motion.div
              className="rounded-full border-2 transition-all duration-200"
              style={{
                width: handleSize,
                height: handleSize,
                backgroundColor: isConnected ? color : 'rgba(0, 0, 0, 0.8)',
                borderColor: isValidTarget ? '#10b981' : color,
                boxShadow: isValidTarget
                  ? `0 0 12px ${color}`
                  : isConnected || isHovered
                  ? `0 0 8px ${color}`
                  : 'none'
              }}
              animate={{
                scale: isValidTarget ? [1, 1.3, 1] : 1
              }}
              transition={{
                duration: 0.6,
                repeat: isValidTarget ? Infinity : 0
              }}
            />

            {/* Inner Dot for Connected State */}
            {isConnected && (
              <motion.div
                className="absolute inset-0 rounded-full m-auto"
                style={{
                  width: handleSize / 2,
                  height: handleSize / 2,
                  backgroundColor: '#ffffff'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              />
            )}

            {/* Cardinality Indicator */}
            {port.cardinality === 'n' && (isHovered || isConnected) && (
              <motion.div
                className="absolute text-[8px] font-bold"
                style={{
                  color: color,
                  ...(port.position === 'left' ? { right: handleSize + 2 } : { left: handleSize + 2 }),
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ∞
              </motion.div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side={port.position === 'left' ? 'left' : port.position === 'right' ? 'right' : 'top'}
          className="text-xs"
        >
          <div className="space-y-1">
            <div className="font-semibold">{port.name}</div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{port.datatype}</span>
              {port.cardinality === 'n' && <span>(multiple)</span>}
              {port.optional && <span>(optional)</span>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
