import { startTransition } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useProjectContext } from './ProjectContext';
import { ProjectSetupTab } from './types';

const TabNavigation = () => {
  const { activeTab, setActiveTab, getVisibleTabs } = useProjectContext();
  const visibleTabs = getVisibleTabs();

  const handleTabChange = (tab: ProjectSetupTab) => {
    if (tab === activeTab) return;
    startTransition(() => {
      setActiveTab(tab);
      performance.mark(`tab:${tab}:selected`);
    });
  };

  return (
    <div className="border-b border-zinc-800 bg-[#0F1219]">
      <div className="container mx-auto">
        <motion.div
          className="flex"
          initial={false}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {visibleTabs.map((tab, index) => (
            <motion.div
              key={tab}
              className={`relative ${index > 0 ? 'flex-1' : ''}`}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <button
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-6 w-full relative transition-all duration-300 flex items-center justify-center ${
                  activeTab === tab
                    ? 'text-white font-medium bg-[#0050E4]'
                    : index < visibleTabs.indexOf(activeTab)
                      ? 'text-blue-400 bg-[#131B2E]'
                      : 'text-zinc-400'
                }`}
              >
                {tab === 'concept' ? 'CONCEPT' :
                 tab === 'storyline' ? 'STORYLINE' :
                 tab === 'settings' ? 'SETTINGS & CAST' : 'BREAKDOWN'}
                {index < visibleTabs.length - 1 && (
                  <ChevronRight className={`ml-2 h-4 w-4 ${
                    activeTab === tab || index < visibleTabs.indexOf(activeTab) ? 'text-white' : 'text-zinc-600'
                  }`} />
                )}
              </button>
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                  layoutId="activeTabIndicator"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TabNavigation;
