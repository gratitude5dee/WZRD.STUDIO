import React from 'react';
import { ProjectFormat, ProjectData, AdBriefData } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DynamicConceptFormProps {
  format: ProjectFormat;
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
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
      return (
        <DefaultConceptForm
          format={format}
          projectData={projectData}
          updateProjectData={updateProjectData}
        />
      );
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
          <Select value={adBrief.adDuration} onValueChange={(value) => updateAdBrief('adDuration', value)}>
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
          <Select value={adBrief.platform} onValueChange={(value) => updateAdBrief('platform', value)}>
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
        <p className="text-sm text-zinc-400">Build a visual narrative that amplifies the audio experience</p>
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
        <p className="text-sm text-zinc-400">Educational content that entertains — learn while you watch</p>
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
          <Select value={infoData.hostStyle} onValueChange={(value) => updateInfoData('hostStyle', value)}>
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
  format: ProjectFormat;
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}> = ({ format, projectData, updateProjectData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-lg font-medium text-white">Input your Concept</Label>
        <p className="text-sm text-zinc-400">
          Describe your story idea, scenes, or paste a full script
        </p>
      </div>

      <Textarea
        value={projectData.concept}
        onChange={(e) => updateProjectData({ concept: e.target.value })}
        placeholder="Input anything from a full script, a few scenes, or a story..."
        className="min-h-[200px] bg-[#111319] border-zinc-700"
      />

      {format === 'custom' && (
        <div className="space-y-2">
          <Label className="text-sm text-zinc-400 uppercase tracking-wide">Custom Format</Label>
          <Input
            value={projectData.customFormat || ''}
            onChange={(e) => updateProjectData({ customFormat: e.target.value })}
            placeholder="Describe the format or structure you'd like"
            className="bg-[#111319] border-zinc-700"
          />
        </div>
      )}

      {projectData.conceptOption === 'ai' && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h3 className="text-sm text-zinc-400 uppercase tracking-wide">Optional Settings</h3>

          <div className="space-y-2">
            <Label className="text-sm text-zinc-400">Special Requests</Label>
            <Input
              value={projectData.specialRequests || ''}
              onChange={(e) => updateProjectData({ specialRequests: e.target.value })}
              placeholder="Anything from '80s atmosphere' to 'plot twists' or 'a car chase'"
              className="bg-[#111319] border-zinc-700"
            />
          </div>

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
      )}
    </div>
  );
};
