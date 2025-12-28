import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectFormat, ProjectData, AdBriefData } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DynamicConceptFormProps {
  format: ProjectFormat;
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

interface ExampleConcept {
  title: string;
  description: string;
  type: 'logline' | 'storyline';
}

export const DynamicConceptForm: React.FC<DynamicConceptFormProps> = ({
  format,
  projectData,
  updateProjectData,
}) => {
  switch (format) {
    case 'commercial':
      return <CommercialForm projectData={projectData} updateProjectData={updateProjectData} />;
    case 'music_video':
      return <MusicVideoForm projectData={projectData} updateProjectData={updateProjectData} />;
    case 'infotainment':
      return <InfotainmentForm projectData={projectData} updateProjectData={updateProjectData} />;
    case 'short_film':
    case 'custom':
    default:
      return <DefaultConceptForm projectData={projectData} updateProjectData={updateProjectData} />;
  }
};

const CommercialForm: React.FC<{
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}> = ({ projectData, updateProjectData }) => {
  const adBrief = projectData.adBrief || {
    product: '',
    targetAudience: '',
    mainMessage: '',
    callToAction: '',
    adDuration: '30s',
    platform: 'all',
    brandGuidelines: '',
  };

  const updateAdBrief = (field: keyof AdBriefData, value: string) => {
    updateProjectData({
      adBrief: { ...adBrief, [field]: value },
      product: field === 'product' ? value : projectData.product,
      targetAudience: field === 'targetAudience' ? value : projectData.targetAudience,
      mainMessage: field === 'mainMessage' ? value : projectData.mainMessage,
      callToAction: field === 'callToAction' ? value : projectData.callToAction,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <h3 className="text-lg font-semibold text-green-400 mb-1">Ad Brief Builder</h3>
        <p className="text-sm text-zinc-400">
          Following AdCP (Advertising Creative Platform) standards for professional commercial production
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">
            Product / Service <span className="text-red-400">*</span>
          </Label>
          <Input
            value={adBrief.product}
            onChange={(e) => updateAdBrief('product', e.target.value)}
            placeholder="e.g., Nike Air Max 2025"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">
            Target Audience <span className="text-red-400">*</span>
          </Label>
          <Input
            value={adBrief.targetAudience}
            onChange={(e) => updateAdBrief('targetAudience', e.target.value)}
            placeholder="e.g., Active millennials aged 25-35"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">
          Key Message <span className="text-red-400">*</span>
        </Label>
        <Textarea
          value={adBrief.mainMessage}
          onChange={(e) => updateAdBrief('mainMessage', e.target.value)}
          placeholder="What's the single most important thing you want viewers to remember?"
          className="bg-[#111319] border-zinc-700 min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">
          Call to Action <span className="text-red-400">*</span>
        </Label>
        <Input
          value={adBrief.callToAction}
          onChange={(e) => updateAdBrief('callToAction', e.target.value)}
          placeholder="e.g., Visit nike.com/airmax"
          className="bg-[#111319] border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">Ad Duration</Label>
          <Select
            value={adBrief.adDuration}
            onValueChange={(value) => updateAdBrief('adDuration', value)}
          >
            <SelectTrigger className="bg-[#111319] border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15s">15 seconds</SelectItem>
              <SelectItem value="30s">30 seconds</SelectItem>
              <SelectItem value="60s">60 seconds</SelectItem>
              <SelectItem value="90s">90 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">Primary Platform</Label>
          <Select
            value={adBrief.platform}
            onValueChange={(value) => updateAdBrief('platform', value)}
          >
            <SelectTrigger className="bg-[#111319] border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="tv">Television</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="streaming">OTT/Streaming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          Brand Guidelines
          <span className="text-xs text-zinc-500">(Optional)</span>
        </Label>
        <Textarea
          value={adBrief.brandGuidelines || ''}
          onChange={(e) => updateAdBrief('brandGuidelines', e.target.value)}
          placeholder="Color codes, typography, do's and don'ts, tone of voice..."
          className="bg-[#111319] border-zinc-700 min-h-[80px]"
        />
      </div>
    </div>
  );
};

const MusicVideoForm: React.FC<{
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}> = ({ projectData, updateProjectData }) => {
  const musicData = projectData.musicVideoData || {
    artistName: '',
    trackTitle: '',
    genre: '',
    lyrics: '',
    performanceRatio: 50,
  };

  const updateMusicData = (field: string, value: string | number) => {
    updateProjectData({
      musicVideoData: { ...musicData, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
        <h3 className="text-lg font-semibold text-pink-400 mb-1">Music Video Brief</h3>
        <p className="text-sm text-zinc-400">
          Build a visual narrative that amplifies the audio experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">
            Artist Name <span className="text-red-400">*</span>
          </Label>
          <Input
            value={musicData.artistName}
            onChange={(e) => updateMusicData('artistName', e.target.value)}
            placeholder="e.g., The Weeknd"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">
            Track Title <span className="text-red-400">*</span>
          </Label>
          <Input
            value={musicData.trackTitle}
            onChange={(e) => updateMusicData('trackTitle', e.target.value)}
            placeholder="e.g., Blinding Lights"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">Genre / Style</Label>
        <Input
          value={musicData.genre}
          onChange={(e) => updateMusicData('genre', e.target.value)}
          placeholder="e.g., Synthwave, Pop, Hip-Hop, Rock..."
          className="bg-[#111319] border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          Lyrics
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
            <FileText className="w-3 h-3 mr-1" /> Upload
          </Button>
        </Label>
        <Textarea
          value={musicData.lyrics || ''}
          onChange={(e) => updateMusicData('lyrics', e.target.value)}
          placeholder="Paste lyrics here for visual scene matching..."
          className="bg-[#111319] border-zinc-700 min-h-[120px] font-mono text-sm"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">Visual Balance</Label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 w-24">Performance</span>
          <Slider
            value={[musicData.performanceRatio]}
            onValueChange={(val) => updateMusicData('performanceRatio', val[0])}
            max={100}
            step={10}
            className="flex-1"
          />
          <span className="text-sm text-zinc-500 w-24 text-right">Narrative</span>
        </div>
        <p className="text-xs text-zinc-500 text-center">
          {musicData.performanceRatio}% Performance / {100 - musicData.performanceRatio}% Narrative
        </p>
      </div>
    </div>
  );
};

const InfotainmentForm: React.FC<{
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}> = ({ projectData, updateProjectData }) => {
  const infoData = projectData.infotainmentData || {
    topic: '',
    educationalGoals: [],
    targetDemographic: '',
    hostStyle: 'casual',
    segments: [],
  };

  const updateInfoData = (field: string, value: string | string[]) => {
    updateProjectData({
      infotainmentData: { ...infoData, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <h3 className="text-lg font-semibold text-amber-400 mb-1">Infotainment Brief</h3>
        <p className="text-sm text-zinc-400">
          Educational content that entertains — learn while you watch
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">
          Topic <span className="text-red-400">*</span>
        </Label>
        <Input
          value={infoData.topic}
          onChange={(e) => updateInfoData('topic', e.target.value)}
          placeholder="e.g., The Science of Sleep"
          className="bg-[#111319] border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">Educational Goals</Label>
        <Textarea
          value={(infoData.educationalGoals || []).join('\n')}
          onChange={(e) =>
            updateInfoData(
              'educationalGoals',
              e.target.value.split('\n').filter(Boolean)
            )
          }
          placeholder="What should viewers learn? (one per line)"
          className="bg-[#111319] border-zinc-700 min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">Target Demographic</Label>
          <Input
            value={infoData.targetDemographic}
            onChange={(e) => updateInfoData('targetDemographic', e.target.value)}
            placeholder="e.g., Curious adults 25-45"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">Presentation Style</Label>
          <Select
            value={infoData.hostStyle}
            onValueChange={(value) => updateInfoData('hostStyle', value)}
          >
            <SelectTrigger className="bg-[#111319] border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual / Conversational</SelectItem>
              <SelectItem value="professional">Professional / Expert</SelectItem>
              <SelectItem value="documentary">Documentary Style</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const DefaultConceptForm: React.FC<{
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}> = ({ projectData, updateProjectData }) => {
  const [conceptCharCount, setConceptCharCount] = useState(0);
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

  useEffect(() => {
    setConceptCharCount(projectData.concept ? projectData.concept.length : 0);
  }, [projectData.concept]);

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

  const handleUseExampleConcept = (concept: ExampleConcept) => {
    updateProjectData({
      title: concept.title,
      concept: concept.description,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <div className="space-y-2">
            <Label className="text-lg font-medium text-white">Input your Concept</Label>
            <p className="text-sm text-zinc-400">
              Describe your story idea, scenes, or paste a full script
            </p>
          </div>

          <motion.div
            className="border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm mt-4 overflow-hidden focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Textarea
              value={projectData.concept}
              onChange={(e) => updateProjectData({ concept: e.target.value })}
              placeholder="Input anything from a full script, a few scenes, or a story..."
              className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none text-foreground placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-between items-center px-4 py-3 text-sm text-muted-foreground border-t border-border/30 bg-card/30">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 bg-card/60 border-border/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Text
              </Button>
              <div className="text-xs">{conceptCharCount} / 12000</div>
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:block lg:w-[350px] ml-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
              Examples
            </h2>
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
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {concept.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {projectData.conceptOption === 'ai' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-medium mb-4 text-white">Optional settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Special Requests</Label>
              <Input
                value={projectData.specialRequests || ''}
                onChange={(e) => updateProjectData({ specialRequests: e.target.value })}
                placeholder="Anything from '80s atmosphere' to 'plot twists' or 'a car chase'"
                className="bg-[#111319] border-zinc-700"
              />
            </div>

            {projectData.format === 'custom' && (
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Custom Format</Label>
                <Input
                  value={projectData.customFormat || ''}
                  onChange={(e) => updateProjectData({ customFormat: e.target.value })}
                  placeholder="Describe the structure or format you want"
                  className="bg-[#111319] border-zinc-700"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Genre</Label>
                <Input
                  value={projectData.genre || ''}
                  onChange={(e) => updateProjectData({ genre: e.target.value })}
                  placeholder="e.g., Thriller, Comedy..."
                  className="bg-[#111319] border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Tone</Label>
                <Input
                  value={projectData.tone || ''}
                  onChange={(e) => updateProjectData({ tone: e.target.value })}
                  placeholder="e.g., Dark, Upbeat..."
                  className="bg-[#111319] border-zinc-700"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
