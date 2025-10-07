import { Suspense, lazy } from 'react';
import ProjectSetupSkeleton from '@/components/project-setup/ProjectSetupSkeleton';

const ProjectSetupWizard = lazy(() => import('@/components/project-setup/ProjectSetupWizard'));

const ProjectSetup = () => {
  const usePerfShell = (import.meta.env.VITE_USE_PERF_SHELL ?? 'true') !== 'false';

  return (
    <div className="min-h-screen bg-[#111319] text-white">
      <Suspense fallback={usePerfShell ? <ProjectSetupSkeleton /> : null}>
        <ProjectSetupWizard />
      </Suspense>
    </div>
  );
};

export default ProjectSetup;
