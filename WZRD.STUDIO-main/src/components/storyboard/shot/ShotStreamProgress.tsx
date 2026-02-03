import { memo, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ShotStreamMeta, ShotStreamStatus } from '@/hooks/useShotStream';

const statusOrder: ShotStreamStatus[] = ['creating', 'drafting', 'enriching', 'ready'];

const statusLabels: Record<ShotStreamStatus, string> = {
  creating: 'Creating',
  drafting: 'Drafting',
  enriching: 'Enriching',
  ready: 'Ready'
};

const statusDescriptions: Record<ShotStreamStatus, string> = {
  creating: 'Creating shot shell…',
  drafting: 'Drafting narrative…',
  enriching: 'Enriching details…',
  ready: 'Shot ready'
};

const formatMs = (value: number | undefined) => {
  if (typeof value !== 'number') return null;
  return `${Math.round(value)}ms`;
};

interface ShotStreamProgressProps {
  status: ShotStreamStatus | null;
  isStreaming: boolean;
  latencyMs: number | null;
  meta: ShotStreamMeta | null;
  phaseDurations: Partial<Record<ShotStreamStatus, number>>;
  progress: number;
}

const ShotStreamProgress = memo(({ status, isStreaming, latencyMs, meta, phaseDurations, progress }: ShotStreamProgressProps) => {
  const progressValue = Math.min(100, Math.max(progress, 0));
  const currentIndex = status ? statusOrder.indexOf(status) : progressValue >= 100 ? statusOrder.length - 1 : -1;

  const headline = useMemo(() => {
    if (status) return statusDescriptions[status];
    return isStreaming ? 'Preparing stream…' : 'Stream idle';
  }, [isStreaming, status]);

  return (
    <div className="flex w-full flex-col items-end gap-2 text-xs text-blue-100/90">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="font-medium text-blue-200">{headline}</span>
        {latencyMs !== null && (
          <span className="text-[11px] uppercase tracking-[0.16em] text-blue-200/70">
            First chunk {Math.round(latencyMs)}ms
          </span>
        )}
        {meta && (
          <Badge variant="outline" className="border-blue-400/50 bg-blue-500/10 text-blue-100">
            req&nbsp;{meta.requestId.slice(0, 6)}
          </Badge>
        )}
      </div>
      <Progress value={progressValue} className="h-1.5 w-60 bg-white/10" />
      <ol className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
        {statusOrder.map((stage, index) => {
          const reached = currentIndex >= index || progressValue >= ((index + 1) / statusOrder.length) * 100 - 0.01;
          const durationLabel = formatMs(phaseDurations[stage]);
          return (
            <li
              key={stage}
              className={cn(
                'flex flex-col items-center gap-1 text-center',
                reached ? 'text-blue-100' : 'text-blue-300/40'
              )}
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors duration-200',
                  reached ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-white/20'
                )}
              />
              <span>{statusLabels[stage]}</span>
              {durationLabel && (
                <span className="text-[9px] font-mono normal-case text-blue-200/60">{durationLabel}</span>
              )}
            </li>
          );
        })}
      </ol>
      {meta && (
        <span className="text-[10px] uppercase tracking-[0.18em] text-blue-200/60">
          Scene {meta.sceneId} · Project {meta.projectId}
        </span>
      )}
    </div>
  );
});

ShotStreamProgress.displayName = 'ShotStreamProgress';

export default ShotStreamProgress;
