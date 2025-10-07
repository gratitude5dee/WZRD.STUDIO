
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useProjectContext } from './ProjectContext';

const NavigationFooter = () => {
  const navigate = useNavigate();
  const { 
    activeTab, 
    getVisibleTabs, 
    saveProjectData, 
    setActiveTab, 
    isCreating,
    isGenerating,
    isFinalizing,
    generateStoryline,
    finalizeProjectSetup,
    projectData,
    projectId
  } = useProjectContext();

  const visibleTabs = getVisibleTabs();
  const currentTabIndex = visibleTabs.indexOf(activeTab);
  const isLastTab = currentTabIndex === visibleTabs.length - 1;
  const isFirstTab = currentTabIndex === 0;

  const handleNext = async () => {
    let nextTab = activeTab;
    let proceed = true;
    
    // Logic for saving and generating
    if (activeTab === 'concept') {
      const savedProjectId = await saveProjectData();
      if (!savedProjectId) {
        proceed = false;
      } else if (projectData.conceptOption === 'ai') {
        // Only generate if AI option is selected and project saved
        const generationSuccess = await generateStoryline(savedProjectId);
        if (!generationSuccess) {
          console.warn("Storyline generation failed, but proceeding to next tab.");
        }
      }
      
      // Proceed to next tab if saving was successful
      if (proceed && currentTabIndex < visibleTabs.length - 1) {
        nextTab = visibleTabs[currentTabIndex + 1];
      }
    } else if (isLastTab) {
      // If on the last tab, finalize and navigate immediately
      if (projectId) {
        // Start background processing (don't await)
        finalizeProjectSetup().catch(err => {
          console.error('Background finalization error:', err);
        });
        
        // Navigate immediately
        navigate(`/timeline/${projectId}`);
      }
      return;
    } else {
      // For other tabs, save data and move to the next one
      await saveProjectData();
      if (currentTabIndex < visibleTabs.length - 1) {
        nextTab = visibleTabs[currentTabIndex + 1];
      }
    }

    // Update active tab if needed and if proceed flag is true
    if (proceed && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  const handleBack = () => {
    if (currentTabIndex > 0) {
      setActiveTab(visibleTabs[currentTabIndex - 1]);
    }
  };

  // Determine if any processing is happening
  const isProcessing = isCreating || isGenerating || isFinalizing;
  
  // Determine the button text based on various states
  const getNextButtonText = () => {
    if (isFinalizing) return "Preparing Timeline...";
    if (isGenerating) return "Generating...";
    if (isCreating) return "Saving...";
    if (isLastTab) return "Go to Timeline";
    return "Next";
  };

  return (
    <motion.div 
      className="border-t border-zinc-800 p-4 flex justify-between items-center bg-[#0F1219]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <Button
        onClick={handleBack}
        variant="outline"
        className={`text-white border-zinc-700 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-opacity duration-300 ${
          isFirstTab || isProcessing ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        disabled={isProcessing || isFirstTab}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <div className="flex-1 flex justify-center">
        <div className="flex space-x-2">
          {visibleTabs.map((tab, i) => (
            <motion.div 
              key={tab}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === currentTabIndex 
                  ? 'bg-blue-500 scale-125' 
                  : i < currentTabIndex
                    ? 'bg-blue-800'
                    : 'bg-zinc-700'
              }`}
              initial={false}
              animate={{ 
                scale: i === currentTabIndex ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleNext}
        disabled={isProcessing}
        className={`px-8 flex items-center gap-2 transition-all duration-300 ${
          isLastTab 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:opacity-50`}
      >
        {getNextButtonText()}
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !isLastTab ? (
          <ArrowRight className="h-4 w-4" />
        ) : null}
      </Button>
    </motion.div>
  );
};

export default NavigationFooter;
