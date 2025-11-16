import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function CanvasLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Setting up your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}

export function CanvasListLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border p-4">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function GenerationLoadingState({ stage }: { stage?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Generating Image</p>
        {stage && (
          <p className="text-xs text-muted-foreground">{stage}</p>
        )}
      </div>
    </div>
  );
}

export function ImageLoadingSkeleton() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
