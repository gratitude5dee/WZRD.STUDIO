import React from 'react';
import { motion } from 'framer-motion';
import { NodeStatus } from '@/types/computeFlow';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface NodeStatusIndicatorProps {
  status: NodeStatus;
  progress?: number;
  error?: string;
}

export const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = ({
  status,
  progress = 0,
  error
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: Clock,
          color: '#f59e0b',
          label: 'Queued',
          animate: false
        };
      case 'running':
        return {
          icon: Loader2,
          color: '#3b82f6',
          label: 'Running',
          animate: true
        };
      case 'succeeded':
        return {
          icon: CheckCircle2,
          color: '#10b981',
          label: 'Success',
          animate: false
        };
      case 'failed':
        return {
          icon: XCircle,
          color: '#ef4444',
          label: 'Failed',
          animate: false
        };
      case 'dirty':
        return {
          icon: AlertCircle,
          color: '#f59e0b',
          label: 'Needs Update',
          animate: false
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config || status === 'idle') return null;

  const Icon = config.icon;

  return (
    <motion.div
      className="absolute top-2 right-2 z-20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md border text-xs font-medium"
        style={{
          backgroundColor: `${config.color}20`,
          borderColor: `${config.color}40`,
          color: config.color
        }}
      >
        <Icon
          className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`}
        />
        <span>{config.label}</span>
        {status === 'running' && progress > 0 && (
          <span className="ml-1 opacity-70">{Math.round(progress)}%</span>
        )}
      </div>

      {/* Progress bar for running state */}
      {status === 'running' && progress > 0 && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-zinc-800/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Error tooltip */}
      {status === 'failed' && error && (
        <div className="absolute top-full mt-2 right-0 w-48 p-2 bg-red-950/90 border border-red-900/50 rounded-lg text-xs text-red-200">
          {error}
        </div>
      )}
    </motion.div>
  );
};
