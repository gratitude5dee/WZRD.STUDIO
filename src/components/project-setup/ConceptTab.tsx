import { useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { type ProjectData, ProjectFormat } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormatSelector } from './FormatSelector';
import { DynamicConceptForm } from './DynamicConceptForm';

interface ConceptTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

interface ExampleConcept {
  title: string;
  description: string;
  type: 'logline' | 'storyline';
}

const ConceptTab = ({ projectData, updateProjectData }: ConceptTabProps) => {
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [exampleConcepts, setExampleConcepts] = useState<ExampleConcept[]>([
    {
      title: 'Forgotten Melody',
      description:
        "A musician's rediscovered composition sparks a journey through love, betrayal, and the hidden glamour of the music industry.",
      type: 'logline',
    },
    {
      title: 'Virtual Nightmare',
      description:
        'A virtual reality platform turns dreams into nightmares as users are trapped within it, forcing a group of tech-savvy strangers to unite and escape before their minds are lost forever.',
      type: 'logline',
    },
    {
      title: 'Holiday Hearts',
      description:
        'At a cozy ski resort, a group of strangers arrives for the holidays, each carrying their own hopes and worries. As their paths cross, unexpected connections form, transforming the season.',
      type: 'storyline',
    },
  ]);

  const handleFormatChange = (format: ProjectFormat) => {
    updateProjectData({ format });
  };

  const handleUseExampleConcept = (concept: ExampleConcept) => {
    updateProjectData({
      title: concept.title,
      concept: concept.description,
    });
  };

  const handleConceptOptionChange = (option: 'ai' | 'manual') => {
    updateProjectData({ conceptOption: option });
  };

  const handleRegenerateExamples = async () => {
    setIsGeneratingExamples(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-concept-examples');

      if (error) throw error;

      if (data?.concepts && Array.isArray(data.concepts)) {
        setExampleConcepts(data.concepts);
        toast.success('New examples generated!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error generating examples:', error);
      toast.error(error.message || 'Failed to generate new examples');
    } finally {
      setIsGeneratingExamples(false);
    }
  };

  return (
    <div className="min-h-full p-6 max-w-6xl mx-auto">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-xl font-semibold text-white mb-4">What are you creating?</h2>
        <FormatSelector selectedFormat={projectData.format} onFormatChange={handleFormatChange} />
      </motion.section>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
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
                <p className="text-sm text-muted-foreground">AI involvement in script editing and writing</p>
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
                <p className="text-sm text-muted-foreground">Visualize your idea or script as written</p>
              </div>
            </motion.div>
          </div>

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

        <div className="hidden lg:block lg:w-[320px]">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Examples</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
              onClick={handleRegenerateExamples}
              disabled={isGeneratingExamples}
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingExamples ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {exampleConcepts.map((concept, index) => (
              <motion.div
                key={index}
                className="bg-card/60 backdrop-blur-sm rounded-xl p-4 cursor-pointer border border-border/40 hover:border-amber/40 hover:shadow-lg hover:shadow-amber/5 transition-all duration-300"
                onClick={() => handleUseExampleConcept(concept)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-foreground">{concept.title}</h3>
                  <span className="text-[10px] text-amber uppercase px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 font-medium">
                    {concept.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{concept.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptTab;
