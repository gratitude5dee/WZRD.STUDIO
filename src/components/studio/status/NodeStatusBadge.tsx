import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type NodeStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'warning';

interface NodeStatusBadgeProps {
  status: NodeStatus;
  progress?: number;
  error?: string;
  estimatedTime?: number;
  className?: string;
}

export const NodeStatusBadge: React.FC<NodeStatusBadgeProps> = ({
  status,
  progress = 0,
  error,
  estimatedTime,
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          icon: <Clock className="w-3 h-3" />,
          label: 'Queued',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          ringColor: 'ring-amber-500/20',
          pulse: true
        };
      case 'running':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: estimatedTime ? `~${estimatedTime}s` : 'Running',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          ringColor: 'ring-blue-500/30',
          pulse: true
        };
      case 'succeeded':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Complete',
          color: 'bg-green-500/10 text-green-400 border-green-500/20',
          ringColor: 'ring-green-500/20',
          pulse: false
        };
      case 'failed':
        return {
          icon: <XCircle className="w-3 h-3" />,
          label: error || 'Failed',
          color: 'bg-red-500/10 text-red-400 border-red-500/20',
          ringColor: 'ring-red-500/20',
          pulse: false
        };
      case 'warning':
        return {
          icon: <Zap className="w-3 h-3" />,
          label: 'Warning',
          color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          ringColor: 'ring-yellow-500/20',
          pulse: false
        };
      default:
        return null;
    }
  };

  if (status === 'idle') return null;

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn('absolute top-2 right-2 z-10', className)}
    >
      <Badge
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium backdrop-blur-sm',
          config.color,
          config.pulse && 'animate-pulse'
        )}
      >
        {config.icon}
        <span>{config.label}</span>
      </Badge>

      {/* Progress ring for running status */}
      {status === 'running' && progress > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--accent-blue)) ${progress * 3.6}deg, transparent 0deg)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
      )}
    </motion.div>
  );
};

interface NodeProgressBarProps {
  progress: number;
  className?: string;
}

export const NodeProgressBar: React.FC<NodeProgressBarProps> = ({ progress, className }) => {
  return (
    <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/50 overflow-hidden', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
};
