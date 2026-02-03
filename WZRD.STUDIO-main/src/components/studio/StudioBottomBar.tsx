import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronUp, Loader2 } from 'lucide-react';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { useCredits } from '@/hooks/useCredits';

const formatRelativeTime = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface StudioBottomBarProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
}

const StudioBottomBar = ({ isSaving: externalIsSaving, lastSaved: externalLastSaved }: StudioBottomBarProps) => {
  const { isSaving: graphIsSaving, execution } = useComputeFlowStore();
  const { availableCredits } = useCredits();
  const [lastSaved, setLastSaved] = useState<Date | null>(externalLastSaved ?? null);
  const prevSaving = useRef(graphIsSaving);

  const isSaving = (externalIsSaving ?? false) || graphIsSaving;
  const lastSavedToDisplay = externalLastSaved ?? lastSaved;

  useEffect(() => {
    if (externalLastSaved !== undefined) {
      setLastSaved(externalLastSaved ?? null);
    }
  }, [externalLastSaved]);

  useEffect(() => {
    if (externalIsSaving !== undefined) return;
    if (prevSaving.current && !graphIsSaving) {
      setLastSaved(new Date());
    }
    prevSaving.current = graphIsSaving;
  }, [graphIsSaving, externalIsSaving]);

  const lowCredits = availableCredits !== null && availableCredits < 25;
  const activeJobs = execution.isRunning
    ? Math.max(1, execution.total - execution.completed)
    : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-surface-1 border-t border-border-subtle flex items-center justify-between z-30" style={{ paddingLeft: '10px', paddingRight: '16px' }}>
      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        {lowCredits && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Low credits</span>
            <button className="ml-1 underline hover:no-underline">Upgrade</button>
          </div>
        )}
        {isSaving && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {!isSaving && lastSavedToDisplay && <span>Saved {formatRelativeTime(lastSavedToDisplay)}</span>}
      </div>

      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-subtle transition-colors">
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-teal" />
          <span className="text-xs font-medium text-text-primary">Queue</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-accent-teal/20 text-[10px] font-semibold text-accent-teal">
          {activeJobs} active
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
      </button>
    </footer>
  );
};

export default StudioBottomBar;
