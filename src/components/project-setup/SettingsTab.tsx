
import { useState, useEffect } from 'react';
import { type ProjectData, Character } from './types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ImageIcon, HelpCircle, Loader2 } from 'lucide-react';
import { useProjectContext } from './ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import CharacterCard from './CharacterCard';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

interface SettingsTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

type AspectRatioOption = '16:9' | '1:1' | '9:16';
type VideoStyleOption = 'none' | 'cinematic' | 'scribble' | 'film-noir';

const SettingsTab = ({ projectData, updateProjectData }: SettingsTabProps) => {
  const { projectId, generationCompletedSignal } = useProjectContext();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>(
    (projectData.aspectRatio as AspectRatioOption) || '16:9'
  );
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<VideoStyleOption>(
    (projectData.videoStyle as VideoStyleOption) || 'cinematic'
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);

  // Fetch characters when projectId changes or after generation completes
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!projectId) {
        setCharacters([]);
        setIsLoadingCharacters(false);
        return;
      }
      setIsLoadingCharacters(true);
      try {
        console.log(`Fetching characters for project: ${projectId}, generation signal: ${generationCompletedSignal}`);
        const characters = await supabaseService.characters.listByProject(projectId);

        console.log(`Found ${characters?.length || 0} characters for project`);
        setCharacters(characters || []);
      } catch (error: any) {
        console.error("Error fetching characters:", error);
        toast.error("Failed to load characters");
        setCharacters([]);
      } finally {
        setIsLoadingCharacters(false);
      }
    };

    fetchCharacters();

    // Set up realtime subscription for character image updates
    if (!projectId) return;

    console.log(`Setting up realtime subscription for project: ${projectId}`);
    const channel = supabase
      .channel(`characters-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Character updated via realtime:', payload.new);
          
          const oldChar = characters.find(c => c.id === payload.new.id);
          const newStatus = payload.new.image_status;
          const oldStatus = oldChar?.image_status;
          
          // Show toast notifications for status changes
          if (oldStatus !== newStatus) {
            if (newStatus === 'generating') {
              toast.info(`Generating image for ${payload.new.name}...`);
            } else if (newStatus === 'completed' && payload.new.image_url) {
              toast.success(`Image generated for ${payload.new.name}`);
            } else if (newStatus === 'failed') {
              toast.error(`Failed to generate image for ${payload.new.name}`, {
                description: payload.new.image_generation_error || 'Unknown error'
              });
            }
          }
          
          // Update the character in the local state
          setCharacters(prev => 
            prev.map(char => 
              char.id === payload.new.id 
                ? { ...char, ...payload.new }
                : char
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log(`Cleaning up realtime subscription for project: ${projectId}`);
      supabase.removeChannel(channel);
    };
  }, [projectId, generationCompletedSignal]);

  // Update projectData when settings change
  useEffect(() => {
    updateProjectData({
      aspectRatio: selectedAspectRatio,
      videoStyle: selectedVideoStyle
    });
  }, [selectedAspectRatio, selectedVideoStyle, updateProjectData]);

  const handleAspectRatioChange = (ratio: AspectRatioOption) => {
    setSelectedAspectRatio(ratio);
  };

  const handleVideoStyleChange = (style: VideoStyleOption) => {
    setSelectedVideoStyle(style);
  };

  const handleAddCharacter = async () => {
    if (!projectId) {
      toast.error("Please save the project first");
      return;
    }
    setIsAddingCharacter(true);
    try {
      const newName = `Character ${characters.length + 1}`;
      const characterId = await supabaseService.characters.create({
        project_id: projectId,
        name: newName,
        description: "A new character."
      });

      const newChar = {
        id: characterId,
        project_id: projectId,
        name: newName,
        description: "A new character.",
        image_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCharacters([...characters, newChar]);
      toast.success(`Added ${newName}`);
    } catch (error: any) {
      console.error("Error adding character:", error);
      toast.error("Failed to add character");
    } finally {
      setIsAddingCharacter(false);
    }
  };

  const handleEditCharacter = (character: Character) => {
    // This would open an edit dialog in a complete implementation
    toast.info(`Edit ${character.name} (functionality coming soon)`);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    try {
      await supabaseService.characters.delete(characterId);
      setCharacters(characters.filter(c => c.id !== characterId));
      toast.success("Character deleted");
    } catch (error: any) {
      console.error("Error deleting character:", error);
      toast.error("Failed to delete character");
    }
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row">
      {/* Settings Section */}
      <div className="w-full md:w-1/2 p-6 border-r border-zinc-800">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="block text-sm font-medium text-gray-400 uppercase">
              PROJECT NAME<span className="text-red-500">*</span>
            </Label>
            <Input 
              id="projectName"
              value={projectData.title || ''} 
              onChange={e => updateProjectData({ title: e.target.value })}
              placeholder="Enter your project name"
              className="w-full bg-[#111319] border-zinc-700 rounded text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-400 uppercase">
              ASPECT RATIO
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '1:1', '9:16'] as AspectRatioOption[]).map(ratio => (
                <button 
                  key={ratio}
                  onClick={() => handleAspectRatioChange(ratio)}
                  className={`flex flex-col items-center justify-center h-12 rounded border ${
                    selectedAspectRatio === ratio 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-[#18191E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className={`border border-current rounded-sm mb-1 ${
                    ratio === '16:9' ? 'w-8 h-5' : ratio === '1:1' ? 'w-5 h-5' : 'w-4 h-7'
                  }`}></div>
                  <span className="text-xs">{ratio}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="block text-sm font-medium text-gray-400 uppercase">
                VIDEO STYLE
              </Label>
              <button className="text-xs text-blue-400 flex items-center">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {(['none', 'cinematic', 'scribble', 'film-noir'] as VideoStyleOption[]).map(style => {
                let imgSrc = '';
                let altText = style.charAt(0).toUpperCase() + style.slice(1);
                if (style === 'cinematic') imgSrc = '/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png';
                if (style === 'scribble') imgSrc = '/lovable-uploads/4e20f36a-2bff-48d8-b07b-257334e35506.png';
                if (style === 'film-noir') imgSrc = '/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png';

                return (
                  <button
                    key={style}
                    onClick={() => handleVideoStyleChange(style)}
                    className={`relative p-1 pb-6 aspect-square rounded border ${
                      selectedVideoStyle === style 
                        ? 'border-blue-500' 
                        : 'border-zinc-700'
                    }`}
                  >
                    <div className={`w-full h-full bg-[#18191E] rounded-sm overflow-hidden flex items-center justify-center ${style === 'film-noir' ? 'grayscale contrast-125' : ''}`}>
                      {imgSrc ? (
                        <img 
                          src={imgSrc} 
                          alt={altText}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-0.5 bg-zinc-600 rounded-full"></div>
                      )}
                    </div>
                    <span className={`absolute bottom-1 left-0 right-0 text-center text-xs ${
                      selectedVideoStyle === style ? 'text-white' : 'text-gray-400'
                    }`}>{altText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-400 uppercase">
              <span>STYLE REFERENCE</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-2 h-4 w-4 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload an image to guide the visual style.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="relative border border-zinc-700 rounded p-8 flex flex-col items-center justify-center gap-2 bg-[#18191E] cursor-pointer hover:border-gray-500 transition-colors">
              <ImageIcon className="h-6 w-6 text-gray-500" />
              <p className="text-gray-400 text-sm">Drag image here</p>
              <p className="text-gray-500 text-xs">Or upload a file</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cinematic-inspiration" className="block text-sm font-medium text-gray-400 uppercase">
              CINEMATIC INSPIRATION
            </Label>
            <Textarea 
              id="cinematic-inspiration"
              value={projectData.cinematicInspiration || ''}
              onChange={e => updateProjectData({ cinematicInspiration: e.target.value })}
              placeholder="E.g., 'Retro, gritty, eclectic, stylish, noir...'"
              className="bg-[#111319] border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Cast Section */}
      <div className="w-full md:w-1/2 p-6">
        <h2 className="text-2xl font-semibold mb-6">Cast</h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Loading State */}
          {isLoadingCharacters && (
            <div className="w-full flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          )}

          {/* Character Cards */}
          {!isLoadingCharacters && characters.length > 0 && characters.map(char => (
            <CharacterCard
              key={char.id}
              character={char}
              onEdit={handleEditCharacter}
              onDelete={handleDeleteCharacter}
            />
          ))}

          {/* Add Character Button */}
          {!isLoadingCharacters && (
            <Card
              onClick={handleAddCharacter}
              className="bg-[#18191E] border border-dashed border-zinc-700 w-56 aspect-[3/4] flex flex-col items-center justify-center p-4 cursor-pointer hover:border-zinc-500 hover:bg-[#222733] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                {isAddingCharacter ? (
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                ) : (
                  <Plus className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <p className="text-gray-400">Add character</p>
            </Card>
          )}

          {/* Empty state message */}
          {!isLoadingCharacters && characters.length === 0 && (
            <div className="w-full text-center py-10 text-zinc-500">
              No characters generated or added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
