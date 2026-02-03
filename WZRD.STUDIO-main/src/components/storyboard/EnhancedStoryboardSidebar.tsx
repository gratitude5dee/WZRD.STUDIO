import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { SidebarData } from '@/types/storyboardTypes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LocationSection } from '@/components/timeline/sections/LocationSection';
import { ClothingSection } from '@/components/timeline/sections/ClothingSection';
import { ObjectSubjectSection } from '@/components/timeline/sections/ObjectSubjectSection';
import { SoundSection } from '@/components/timeline/sections/SoundSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileCode } from 'lucide-react';

interface EnhancedStoryboardSidebarProps {
  data: SidebarData;
  sceneId: string;
  onUpdate: (updates: {
    description?: string | null;
    location?: string | null;
    lighting?: string | null;
    weather?: string | null;
  }) => void;
}

const EnhancedStoryboardSidebar: React.FC<EnhancedStoryboardSidebarProps> = ({
  data,
  sceneId,
  onUpdate
}) => {
  const [sceneDesc, setSceneDesc] = useState(data.sceneDescription || '');
  const [openSections, setOpenSections] = useState({
    location: true,
    style: false,
    clothing: false,
    objects: false,
    sound: false
  });

  useEffect(() => {
    setSceneDesc(data.sceneDescription || '');
  }, [data.sceneDescription]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleUpdate = (field: keyof Parameters<typeof onUpdate>[0], value: string | null) => {
    onUpdate({ [field]: value });
  };

  const labelBaseClass = "text-[10px] font-medium uppercase text-zinc-400 mb-1 block";
  const inputBaseClass = cn(
    "rounded-lg text-xs h-8 px-3",
    "bg-zinc-900/50 backdrop-blur-sm",
    "border border-zinc-800/50",
    "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
    "shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
    "transition-all duration-200",
    "placeholder:text-zinc-600"
  );

  return (
    <div className={cn(
      "w-full h-full relative overflow-hidden",
      "bg-gradient-to-br from-zinc-950/95 to-[#0A0A0F]",
      "backdrop-blur-xl border-r border-white/[0.06]",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
    )}>
      <ScrollArea className="h-full text-white">
        <div className="p-5 space-y-5">
          {/* Project Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className={cn(
              "rounded-xl p-4 mb-6",
              "bg-gradient-to-br from-purple-950/30 to-zinc-900/40",
              "backdrop-blur-sm border border-purple-500/20",
              "shadow-[0_4px_20px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.03)]"
            )}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />

              <h2 className="text-lg font-bold text-purple-400 mb-2 font-serif tracking-wide relative z-10
                shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                {data.projectTitle || 'Project Title'}
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 relative z-10">
                {data.projectDescription || 'No project description.'}
              </p>
            </div>
          </motion.div>

          {/* Scene Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label htmlFor="scene-desc" className={labelBaseClass}>Scene Description</label>
            <Textarea
              id="scene-desc"
              value={sceneDesc}
              onChange={(e) => setSceneDesc(e.target.value)}
              onBlur={() => handleUpdate('description', sceneDesc)}
              placeholder="Describe the scene..."
              className={cn(inputBaseClass, "min-h-[80px]")}
            />
          </motion.div>

          {/* Enhanced Location Section */}
          <LocationSection
            sceneId={sceneId}
            initialData={{
              name: data.sceneLocation || '',
              timeOfDay: '',
              weather: '',
              atmosphere: '',
              specificElements: [],
              cameraEnvironment: ''
            }}
            onUpdate={(locationData) => {
              handleUpdate('location', locationData.name);
            }}
            isOpen={openSections.location}
            onToggle={() => toggleSection('location')}
          />

          {/* Style Section */}
          <Collapsible
            open={openSections.style}
            onOpenChange={() => toggleSection('style')}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <motion.div
                className={cn(
                  "flex items-center justify-between cursor-pointer py-2 px-3 rounded-lg",
                  "hover:bg-zinc-800/30 transition-all duration-200",
                  "border border-transparent hover:border-zinc-700/50"
                )}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-200">Style</span>
                </div>
                <motion.div
                  animate={{ rotate: openSections.style ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </motion.div>
              </motion.div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-5">
                <label className={labelBaseClass}>Video Style</label>
                <p className="text-xs text-zinc-300 capitalize">{data.videoStyle || 'Not Set'}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Clothing Section */}
          <ClothingSection
            sceneId={sceneId}
            characters={data.characters || []}
            isOpen={openSections.clothing}
            onToggle={() => toggleSection('clothing')}
          />

          {/* Objects/Subjects Section */}
          <ObjectSubjectSection
            sceneId={sceneId}
          />

          {/* Sound Section */}
          <SoundSection
            sceneId={sceneId}
            isOpen={openSections.sound}
            onToggle={() => toggleSection('sound')}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedStoryboardSidebar;
