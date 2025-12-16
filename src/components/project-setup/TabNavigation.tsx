import { startTransition } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useProjectContext } from './ProjectContext';
import { ProjectSetupTab } from './types';
import { cn } from '@/lib/utils';

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

  const getTabIndex = (tab: ProjectSetupTab) => visibleTabs.indexOf(tab);
  const activeIndex = getTabIndex(activeTab);

  const getTabLabel = (tab: ProjectSetupTab) => {
    switch (tab) {
      case 'concept': return 'Concept';
      case 'storyline': return 'Storyline';
      case 'settings': return 'Settings & Cast';
      case 'breakdown': return 'Breakdown';
      default: return tab;
    }
  };

  return (
    <div className={cn(
      "border-b px-6 py-4",
      "bg-gradient-to-r from-[rgba(15,15,20,0.8)] via-[rgba(12,12,18,0.6)] to-[rgba(15,15,20,0.8)]",
      "backdrop-blur-xl border-white/[0.05]"
    )}>
      <div className="container mx-auto">
        <div className="flex items-center gap-3">
          {visibleTabs.map((tab, index) => {
            const isActive = activeTab === tab;
            const isCompleted = index < activeIndex;
            const stepNumber = index + 1;

            return (
              <motion.div
                key={tab}
                className="flex items-center"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "relative flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                    "backdrop-blur-md border",
                    isActive && [
                      "bg-primary/15 text-primary border-primary/30",
                      "shadow-[0_0_24px_rgba(20,184,166,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]"
                    ],
                    isCompleted && !isActive && [
                      "bg-primary/10 text-primary/80 border-primary/20"
                    ],
                    !isActive && !isCompleted && [
                      "bg-white/[0.03] text-muted-foreground border-white/[0.06]",
                      "hover:text-foreground hover:bg-white/[0.06] hover:border-white/[0.1]"
                    ]
                  )}
                >
                  {/* Step number or checkmark */}
                  <span className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300",
                    isActive && "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(20,184,166,0.4)]",
                    isCompleted && !isActive && "bg-primary/70 text-primary-foreground",
                    !isActive && !isCompleted && "bg-white/[0.08] text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                  </span>
                  
                  <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                      layoutId="activeTabIndicator"
                      transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
                
                {/* Connector */}
                {index < visibleTabs.length - 1 && (
                  <div className={cn(
                    "mx-2 w-8 h-px transition-colors duration-300",
                    index < activeIndex 
                      ? "bg-gradient-to-r from-primary/50 to-primary/30" 
                      : "bg-white/[0.08]"
                  )} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
