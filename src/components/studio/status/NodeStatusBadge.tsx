import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type NodeStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'warning' | 'canceled' | 'dirty';

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
          icon: <Clock className="h-3 w-3" />,
          label: 'Queued',
          color: 'bg-blue-900/50 text-blue-400 border border-blue-500/30',
          pulse: true,
        };
      case 'running':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: estimatedTime ? `~${estimatedTime}s` : 'Running',
          color: 'bg-blue-900/50 text-blue-400 border border-blue-500/30',
          pulse: true,
        };
      case 'succeeded':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          label: 'Done',
          color: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30',
          pulse: false,
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: error || 'Error',
          color: 'bg-red-900/50 text-red-400 border border-red-500/30',
          pulse: false,
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: 'Canceled',
          color: 'bg-zinc-800/80 text-amber-300 border border-amber-500/30',
          pulse: false,
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Warning',
          color: 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30',
          pulse: false,
        };
      default:
        return {
          icon: <Circle className="h-3 w-3" />,
          label: null,
          color: 'bg-zinc-700 text-zinc-400 border border-zinc-600/50',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn('absolute right-2 top-2 z-10', className)}
    >
      <Badge
        className={cn(
          'flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium backdrop-blur-sm',
          config.color,
          config.pulse && 'animate-pulse'
        )}
      >
        {config.icon}
        {config.label && <span>{config.label}</span>}
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
