
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, Info, Plus } from 'lucide-react';
import { type ProjectData } from './types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [conceptCharCount, setConceptCharCount] = useState(0);
  const [showCommercialOptions, setShowCommercialOptions] = useState(false);
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [exampleConcepts, setExampleConcepts] = useState<ExampleConcept[]>([
    {
      title: 'Forgotten Melody',
      description: 'A musician\'s rediscovered composition sparks a journey through love, betrayal, and the hidden glamour of the music industry.',
      type: 'logline'
    },
    {
      title: 'Virtual Nightmare',
      description: 'A virtual reality platform turns dreams into nightmares as users are trapped within it, forcing a group of tech-savvy strangers to unite and escape before their minds are lost forever.',
      type: 'logline'
    },
    {
      title: 'Holiday Hearts',
      description: 'At a cozy ski resort, a group of strangers arrives for the holidays, each carrying their own hopes and worries. As their paths cross, unexpected connections form, transforming the season.',
      type: 'storyline'
    }
  ]);

  // Update character count when concept changes
  useEffect(() => {
    setConceptCharCount(projectData.concept ? projectData.concept.length : 0);
  }, [projectData.concept]);

  const handleConceptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateProjectData({ concept: e.target.value });
  };

  const handleSpecialRequestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ specialRequests: e.target.value });
  };

  const handleFormatChange = (format: string) => {
    updateProjectData({ format });
    // Show commercial options only when commercial format is selected
    setShowCommercialOptions(format === 'commercial');
  };

  const handleCustomFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ customFormat: e.target.value });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ genre: e.target.value });
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ tone: e.target.value });
  };

  const handleVoiceoverToggle = () => {
    updateProjectData({ addVoiceover: !projectData.addVoiceover });
  };

  const handleUseExampleConcept = (concept: ExampleConcept) => {
    updateProjectData({ 
      title: concept.title,
      concept: concept.description 
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

  // Handle commercial-specific field changes
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ product: e.target.value });
  };

  const handleTargetAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ targetAudience: e.target.value });
  };

  const handleMainMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ mainMessage: e.target.value });
  };

  const handleCallToActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ callToAction: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-full bg-[#111319]">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Input your concept</h1>
        
        <div className="flex mb-6">
          <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Option cards with enhanced animations */}
            <motion.div 
              className={`p-6 rounded-lg ${projectData.conceptOption === 'ai' ? 'bg-[#001036] border border-blue-600' : 'bg-[#1E222B]'} cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300`}
              onClick={() => handleConceptOptionChange('ai')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {projectData.conceptOption === 'ai' && (
                <motion.div 
                  className="absolute inset-0 bg-blue-500/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className={`p-2 ${projectData.conceptOption === 'ai' ? 'text-blue-400' : 'text-zinc-400'} transition-colors duration-300`}>
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${projectData.conceptOption === 'ai' ? 'text-blue-400' : 'text-white'} transition-colors duration-300`}>
                  Develop concept with AI
                </h3>
                <p className="text-sm text-zinc-400">AI involvement in script editing and writing</p>
              </div>
            </motion.div>
            
            <motion.div 
              className={`p-6 rounded-lg ${projectData.conceptOption === 'manual' ? 'bg-[#001036] border border-blue-600' : 'bg-[#1E222B]'} cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300`}
              onClick={() => handleConceptOptionChange('manual')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {projectData.conceptOption === 'manual' && (
                <motion.div 
                  className="absolute inset-0 bg-blue-500/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className={`p-2 ${projectData.conceptOption === 'manual' ? 'text-blue-400' : 'text-zinc-400'} transition-colors duration-300`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${projectData.conceptOption === 'manual' ? 'text-blue-400' : 'text-white'} transition-colors duration-300`}>
                  Stick to the script
                </h3>
                <p className="text-sm text-zinc-400">Visualize your idea or script as written</p>
              </div>
            </motion.div>
          </div>
          
          {/* Examples section (only visible on desktop) */}
          <div className="hidden lg:block lg:w-[350px] ml-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="font-semibold text-zinc-300">EXAMPLES</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-zinc-400 hover:text-zinc-200"
                onClick={handleRegenerateExamples}
                disabled={isGeneratingExamples}
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingExamples ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="space-y-4">
              {exampleConcepts.map((concept, index) => (
                <motion.div 
                  key={index} 
                  className="bg-[#1E222B] rounded-lg p-4 cursor-pointer hover:bg-[#252A36] transition-colors"
                  onClick={() => handleUseExampleConcept(concept)}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(45, 55, 72, 1)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-white">{concept.title}</h3>
                    <span className="text-xs text-zinc-500 uppercase px-2 py-0.5 rounded border border-zinc-800">
                      {concept.type}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{concept.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Text area */}
        <motion.div 
          className="border border-zinc-800 rounded-lg bg-[#111319] mb-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Textarea 
            value={projectData.concept}
            onChange={handleConceptChange}
            placeholder="Input anything from a full script, a few scenes, or a story..."
            className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none text-white placeholder:text-zinc-600"
          />
          <div className="flex justify-between items-center px-3 py-2 text-sm text-zinc-500 border-t border-zinc-800">
            <Button variant="outline" size="sm" className="h-8 px-3 bg-[#1E222B] border-zinc-800 text-zinc-400 hover:bg-zinc-800">
              <FileText className="h-4 w-4 mr-2" />
              Upload Text
            </Button>
            <div>{conceptCharCount} / 12000</div>
          </div>
        </motion.div>
        
        {/* Optional settings (only shown for AI option) */}
        {projectData.conceptOption === 'ai' && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-medium mb-4 text-white">Optional settings</h2>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="flex items-center text-sm text-zinc-400 mb-2 gap-1">
                  SPECIAL REQUESTS
                  <Info className="h-4 w-4" />
                </label>
                <Input
                  value={projectData.specialRequests || ''}
                  onChange={handleSpecialRequestsChange}
                  placeholder="Anything from '80s atmosphere' to 'plot twists' or 'a car chase'"
                  className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <label className="text-sm text-zinc-400 mb-2 block">FORMAT</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={projectData.format === 'custom' ? 'default' : 'outline'}
                    className={`rounded-full transition-all duration-300 ${projectData.format === 'custom' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                    onClick={() => handleFormatChange('custom')}
                  >
                    Custom
                  </Button>
                  <Button
                    type="button"
                    variant={projectData.format === 'short' ? 'default' : 'outline'}
                    className={`rounded-full transition-all duration-300 ${projectData.format === 'short' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                    onClick={() => handleFormatChange('short')}
                  >
                    Short Film
                  </Button>
                  <Button
                    type="button"
                    variant={projectData.format === 'commercial' ? 'default' : 'outline'}
                    className={`rounded-full transition-all duration-300 ${projectData.format === 'commercial' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                    onClick={() => handleFormatChange('commercial')}
                  >
                    Commercial
                  </Button>
                </div>
              </motion.div>
              
              {projectData.format === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <label className="text-sm text-zinc-400 mb-2 block">CUSTOM FORMAT</label>
                  <Input
                    value={projectData.customFormat || ''}
                    onChange={handleCustomFormatChange}
                    placeholder="How should the AI shape your story?"
                    className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </motion.div>
              )}
              
              {/* Commercial-specific fields */}
              {showCommercialOptions && (
                <div className="border-l-2 border-blue-600 pl-4 space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">PRODUCT / SERVICE</label>
                    <Input
                      value={projectData.product || ''}
                      onChange={handleProductChange}
                      placeholder="What are you advertising?"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">TARGET AUDIENCE</label>
                    <Input
                      value={projectData.targetAudience || ''}
                      onChange={handleTargetAudienceChange}
                      placeholder="Who are you advertising to?"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">MAIN MESSAGE</label>
                    <Input
                      value={projectData.mainMessage || ''}
                      onChange={handleMainMessageChange}
                      placeholder="What do you want your audience to remember?"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">CALL TO ACTION</label>
                    <Input
                      value={projectData.callToAction || ''}
                      onChange={handleCallToActionChange}
                      placeholder="What do you want your audience to do?"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
              )}
              
              {!showCommercialOptions && (
                <>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">GENRE</label>
                    <Input
                      value={projectData.genre}
                      onChange={handleGenreChange}
                      placeholder="This defines the overall style or category of your story"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">TONE</label>
                    <Input
                      value={projectData.tone}
                      onChange={handleToneChange}
                      placeholder="This shapes the mood and emotional impact of your story"
                      className="w-full bg-[#1E222B] border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                </>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-3 text-white">Speech</h3>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-zinc-400 gap-1">
                    ADD VOICEOVER
                    <Info className="h-4 w-4" />
                  </label>
                  <div 
                    onClick={handleVoiceoverToggle}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${projectData.addVoiceover ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  >
                    <div 
                      className={`block w-4 h-4 rounded-full bg-white transition-transform duration-300 ${projectData.addVoiceover ? 'transform translate-x-6' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConceptTab;
