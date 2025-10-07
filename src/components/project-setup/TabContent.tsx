import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectContext } from './ProjectContext';

const ConceptTab = lazy(() => import('./ConceptTab'));
const StorylineTab = lazy(() => import('./StorylineTab'));
const SettingsTab = lazy(() => import('./SettingsTab'));
const BreakdownTab = lazy(() => import('./BreakdownTab'));

const shimmer = 'relative overflow-hidden rounded-xl bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

const TabFallback = () => (
  <div className="space-y-6 px-6 py-10" role="status" aria-live="polite">
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    <div className={`${shimmer} h-8 w-64`} aria-hidden />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${shimmer} h-56 w-full`} aria-hidden />
      <div className="space-y-4">
        <div className={`${shimmer} h-20 w-full`} aria-hidden />
        <div className={`${shimmer} h-20 w-full`} aria-hidden />
        <div className={`${shimmer} h-20 w-full`} aria-hidden />
      </div>
    </div>
  </div>
);

const TabContent = () => {
  const { activeTab, projectData, updateProjectData } = useProjectContext();

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  } as const;

  return (
    <div className="flex-1 overflow-auto bg-[#111319]">
      <AnimatePresence mode="wait">
        {activeTab === 'concept' && (
          <motion.div
            key="concept"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Suspense fallback={<TabFallback />}>
              <ConceptTab projectData={projectData} updateProjectData={updateProjectData} />
            </Suspense>
          </motion.div>
        )}
        {activeTab === 'storyline' && (
          <motion.div
            key="storyline"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Suspense fallback={<TabFallback />}>
              <StorylineTab projectData={projectData} updateProjectData={updateProjectData} />
            </Suspense>
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Suspense fallback={<TabFallback />}>
              <SettingsTab projectData={projectData} updateProjectData={updateProjectData} />
            </Suspense>
          </motion.div>
        )}
        {activeTab === 'breakdown' && (
          <motion.div
            key="breakdown"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Suspense fallback={<TabFallback />}>
              <BreakdownTab projectData={projectData} updateProjectData={updateProjectData} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TabContent;
