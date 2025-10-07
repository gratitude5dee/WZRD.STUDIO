import { memo } from 'react';
import { cn } from '@/lib/utils';

interface PerfShellProps {
  headline?: string;
  description?: string;
  className?: string;
}

const shimmer = 'relative overflow-hidden rounded-md bg-slate-800/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

export const PerfShell = memo(({ headline = 'Loading studio…', description = 'Preparing your creative workspace', className }: PerfShellProps) => {
  return (
    <div className={cn('min-h-screen bg-[#0b0d13] text-white', className)} aria-busy="true" aria-live="polite">
      <style>
        {`@keyframes shimmer { 100% { transform: translateX(100%); } }`}
      </style>
      <div className="border-b border-white/5 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10', shimmer)} aria-hidden />
            <div>
              <div className={cn('h-4 w-32', shimmer)} aria-hidden />
              <div className="mt-2 h-3 w-48 text-xs text-white/50">{description}</div>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm text-white/60 sm:flex">
            <div className={cn('h-3 w-16', shimmer)} aria-hidden />
            <div className={cn('h-3 w-16', shimmer)} aria-hidden />
            <div className={cn('h-3 w-16', shimmer)} aria-hidden />
          </div>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-10">
        <header>
          <h1 className="text-2xl font-semibold text-white/90">{headline}</h1>
          <p className="mt-2 text-sm text-white/60">We render the interactive editor once the critical bundle arrives.</p>
        </header>
        <section className="grid gap-6 md:grid-cols-[2fr,1fr]" role="status">
          <div className="space-y-4">
            <div className={cn('h-40 w-full', shimmer)} aria-hidden />
            <div className={cn('h-40 w-full', shimmer)} aria-hidden />
          </div>
          <aside className="space-y-4">
            <div className={cn('h-24 w-full', shimmer)} aria-hidden />
            <div className={cn('h-24 w-full', shimmer)} aria-hidden />
          </aside>
        </section>
      </main>
    </div>
  );
});

PerfShell.displayName = 'PerfShell';

export default PerfShell;
