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
      "border-b px-6 py-3",
      "bg-gradient-to-r from-card/80 via-card/60 to-card/80",
      "backdrop-blur-sm border-border/30"
    )}>
      <div className="container mx-auto">
        <div className="flex items-center gap-2">
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
                    "relative flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                    isActive && "bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/10",
                    isCompleted && !isActive && "bg-primary/10 text-primary/80 border border-primary/20",
                    !isActive && !isCompleted && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* Step number or checkmark */}
                  <span className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && !isActive && "bg-primary/80 text-primary-foreground",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                  </span>
                  
                  <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                      layoutId="activeTabIndicator"
                      transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
                
                {/* Connector */}
                {index < visibleTabs.length - 1 && (
                  <ChevronRight className={cn(
                    "mx-1 h-4 w-4 transition-colors duration-300",
                    index < activeIndex ? "text-primary/60" : "text-muted-foreground/40"
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
