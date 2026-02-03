import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
          color: 'bg-surface-3 text-text-tertiary',
          pulse: true,
        };
      case 'running':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: estimatedTime ? `~${estimatedTime}s` : 'Running',
          color: 'bg-accent-purple/20 text-accent-purple',
          pulse: true,
        };
      case 'succeeded':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          label: 'Done',
          color: 'bg-accent-emerald/15 text-accent-emerald',
          pulse: false,
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: error || 'Error',
          color: 'bg-accent-rose/15 text-accent-rose',
          pulse: false,
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: 'Canceled',
          color: 'bg-surface-3 text-text-tertiary',
          pulse: false,
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Warning',
          color: 'bg-accent-amber/15 text-accent-amber',
          pulse: false,
        };
      case 'dirty':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Dirty',
          color: 'bg-accent-amber/15 text-accent-amber',
          pulse: false,
        };
      default:
        return {
          icon: <Circle className="h-3 w-3" />,
          label: 'Idle',
          color: 'bg-surface-3 text-text-tertiary',
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
      <span
        className={cn(
          'flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm',
          config.color,
          config.pulse && 'animate-pulse-subtle'
        )}
      >
        {config.icon}
        {config.label && <span>{config.label}</span>}
      </span>

      {/* Progress ring for running status */}
      {status === 'running' && progress > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--accent-purple)) ${progress * 3.6}deg, transparent 0deg)`
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
