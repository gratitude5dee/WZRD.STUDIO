import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, FileText } from 'lucide-react';
import { FormatSelector } from './FormatSelector';
import { DynamicConceptForm } from './DynamicConceptForm';
import { type ProjectData, ProjectFormat } from './types';

interface ConceptTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const ConceptTab = ({ projectData, updateProjectData }: ConceptTabProps) => {
  const handleFormatChange = (format: ProjectFormat) => {
    updateProjectData({ format });
  };

  const handleConceptOptionChange = (option: 'ai' | 'manual') => {
    updateProjectData({ conceptOption: option });
  };

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">What are you creating?</h2>
        <FormatSelector
          selectedFormat={projectData.format}
          onFormatChange={handleFormatChange}
        />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">How do you want to build it?</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            className={`p-6 rounded-xl cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300 backdrop-blur-sm border ${
              projectData.conceptOption === 'ai'
                ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/60 border-border/40 hover:border-border/60'
            }`}
            onClick={() => handleConceptOptionChange('ai')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {projectData.conceptOption === 'ai' && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                projectData.conceptOption === 'ai'
                  ? 'text-primary bg-primary/20'
                  : 'text-muted-foreground bg-muted/50'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-medium transition-colors duration-300 ${
                  projectData.conceptOption === 'ai' ? 'text-primary' : 'text-foreground'
                }`}
              >
                Develop concept with AI
              </h3>
              <p className="text-sm text-muted-foreground">
                AI involvement in script editing and writing
              </p>
            </div>
          </motion.div>

          <motion.div
            className={`p-6 rounded-xl cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300 backdrop-blur-sm border ${
              projectData.conceptOption === 'manual'
                ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/60 border-border/40 hover:border-border/60'
            }`}
            onClick={() => handleConceptOptionChange('manual')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {projectData.conceptOption === 'manual' && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                projectData.conceptOption === 'manual'
                  ? 'text-primary bg-primary/20'
                  : 'text-muted-foreground bg-muted/50'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-medium transition-colors duration-300 ${
                  projectData.conceptOption === 'manual' ? 'text-primary' : 'text-foreground'
                }`}
              >
                Stick to the script
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualize your idea or script as written
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        <motion.section
          key={projectData.format}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <DynamicConceptForm
            format={projectData.format}
            projectData={projectData}
            updateProjectData={updateProjectData}
          />
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default ConceptTab;
