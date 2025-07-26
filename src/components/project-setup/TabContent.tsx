
import { motion, AnimatePresence } from 'framer-motion';
import ConceptTab from './ConceptTab';
import StorylineTab from './StorylineTab';
import SettingsTab from './SettingsTab';
import BreakdownTab from './BreakdownTab';
import { useProjectContext } from './ProjectContext';

const TabContent = () => {
  const { activeTab, projectData, updateProjectData } = useProjectContext();

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

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
            <ConceptTab projectData={projectData} updateProjectData={updateProjectData} />
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
            <StorylineTab projectData={projectData} updateProjectData={updateProjectData} />
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
            <SettingsTab projectData={projectData} updateProjectData={updateProjectData} />
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
            <BreakdownTab projectData={projectData} updateProjectData={updateProjectData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TabContent;
