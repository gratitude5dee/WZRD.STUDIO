import { memo } from 'react';

const shimmer = 'relative overflow-hidden rounded-xl bg-slate-800/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

interface ShotCardSkeletonProps {
  label?: string;
}

const ShotCardSkeleton = memo(({ label = 'Generating shot…' }: ShotCardSkeletonProps) => {
  return (
    <article className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/5 bg-black/60 p-4 text-white/70" data-testid="shot-card-skeleton">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <header className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.2em] text-white/40">{label}</span>
        <div className={`${shimmer} h-6 w-6 rounded-full`} aria-hidden />
      </header>
      <div className={`${shimmer} h-40 w-full rounded-xl`} aria-hidden />
      <div className="space-y-3">
        <div className={`${shimmer} h-4 w-32 rounded-lg`} aria-hidden />
        <div className={`${shimmer} h-3 w-full rounded-lg`} aria-hidden />
        <div className={`${shimmer} h-3 w-5/6 rounded-lg`} aria-hidden />
      </div>
      <footer className="flex items-center justify-between text-xs text-white/40">
        <div className={`${shimmer} h-3 w-20 rounded-lg`} aria-hidden />
        <div className={`${shimmer} h-8 w-24 rounded-full`} aria-hidden />
      </footer>
    </article>
  );
});

ShotCardSkeleton.displayName = 'ShotCardSkeleton';

export default ShotCardSkeleton;
