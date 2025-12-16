import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Music, Play, Pause, Download, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAudioGeneration, VOICE_OPTIONS, AudioType } from '@/hooks/useAudioGeneration';
import { cn } from '@/lib/utils';

interface AudioGenerationPanelProps {
  className?: string;
}

export function AudioGenerationPanel({ className }: AudioGenerationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<AudioType>('tts');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // TTS state
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  
  // SFX state
  const [sfxPrompt, setSfxPrompt] = useState('');
  const [sfxDuration, setSfxDuration] = useState(5);
  
  // Music state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicDuration, setMusicDuration] = useState(30);

  const {
    isGenerating,
    currentAudioUrl,
    generateTTS,
    generateSFX,
    generateMusic,
    playAudio,
    stopAudio,
    downloadAudio,
  } = useAudioGeneration();

  const handleGenerate = async () => {
    switch (activeTab) {
      case 'tts':
        await generateTTS(ttsText, selectedVoice);
        break;
      case 'sfx':
        await generateSFX(sfxPrompt, sfxDuration);
        break;
      case 'music':
        await generateMusic(musicPrompt, musicDuration);
        break;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      playAudio();
      setIsPlaying(true);
    }
  };

  const getButtonLabel = () => {
    if (isGenerating) {
      switch (activeTab) {
        case 'tts': return 'Generating Voice...';
        case 'sfx': return 'Generating Sound...';
        case 'music': return 'Generating Music...';
      }
    }
    switch (activeTab) {
      case 'tts': return 'Generate Voice';
      case 'sfx': return 'Generate Sound Effect';
      case 'music': return 'Generate Music';
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? 'auto' : '60px' }}
      className={cn(
        "border-t border-border bg-card/95 backdrop-blur-xl",
        className
      )}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Audio Generation</h3>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-4"
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AudioType)}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="tts" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Voice Over
                </TabsTrigger>
                <TabsTrigger value="sfx" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sound FX
                </TabsTrigger>
                <TabsTrigger value="music" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Music
                </TabsTrigger>
              </TabsList>

              {/* TTS Tab */}
              <TabsContent value="tts" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Text to speak
                  </label>
                  <Textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Voice
                  </label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_OPTIONS.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} - {voice.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* SFX Tab */}
              <TabsContent value="sfx" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Describe the sound effect
                  </label>
                  <Textarea
                    value={sfxPrompt}
                    onChange={(e) => setSfxPrompt(e.target.value)}
                    placeholder="e.g., Thunder rumbling in the distance, footsteps on gravel, door creaking..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Duration: {sfxDuration}s
                  </label>
                  <Slider
                    value={[sfxDuration]}
                    onValueChange={([v]) => setSfxDuration(v)}
                    min={1}
                    max={22}
                    step={1}
                    className="py-2"
                  />
                </div>
              </TabsContent>

              {/* Music Tab */}
              <TabsContent value="music" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Describe the music
                  </label>
                  <Textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    placeholder="e.g., Upbeat electronic music with synth melodies, cinematic orchestral score..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Duration: {musicDuration}s
                  </label>
                  <Slider
                    value={[musicDuration]}
                    onValueChange={([v]) => setMusicDuration(v)}
                    min={10}
                    max={120}
                    step={5}
                    className="py-2"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {getButtonLabel()}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {getButtonLabel()}
                  </>
                )}
              </Button>

              {currentAudioUrl && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                    className="shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => downloadAudio()}
                    className="shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
