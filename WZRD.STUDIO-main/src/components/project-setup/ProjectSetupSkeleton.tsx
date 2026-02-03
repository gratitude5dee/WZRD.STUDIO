const shimmer = 'relative overflow-hidden rounded-lg bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

const ProjectSetupSkeleton = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#111319] text-white" role="status" aria-live="polite" data-testid="project-setup-skeleton">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <header className="border-b border-white/5 bg-black/30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className={`${shimmer} h-8 w-56`} aria-hidden />
            <div className={`${shimmer} h-4 w-80`} aria-hidden />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`${shimmer} h-9 w-28`} aria-hidden />
            <div className={`${shimmer} h-9 w-28`} aria-hidden />
          </div>
        </div>
      </header>
      <nav className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-6xl gap-3 overflow-x-auto px-6 py-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={`${shimmer} h-10 w-32 flex-shrink-0`} aria-hidden />
          ))}
        </div>
      </nav>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        <div className={`${shimmer} h-44 w-full`} aria-hidden />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${shimmer} h-56 w-full`} aria-hidden />
          <div className="space-y-4">
            <div className={`${shimmer} h-20 w-full`} aria-hidden />
            <div className={`${shimmer} h-20 w-full`} aria-hidden />
            <div className={`${shimmer} h-20 w-full`} aria-hidden />
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className={`${shimmer} h-4 w-40`} aria-hidden />
          <div className="flex gap-3">
            <div className={`${shimmer} h-10 w-28`} aria-hidden />
            <div className={`${shimmer} h-10 w-28`} aria-hidden />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectSetupSkeleton;
