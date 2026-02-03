import { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown, Mic, Volume2, Loader2, Play, Pause, Trash2, Sparkles, Save } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSaveToProjectAssets } from '@/hooks/useSaveToProjectAssets';

interface SoundSectionProps {
  sceneId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface GeneratedAudio {
  id: string;
  prompt: string;
  audioUrl?: string;
  status: 'generating' | 'ready' | 'failed';
  type: 'voiceover' | 'sfx' | 'music';
}

const SFX_PRESETS = [
  { label: 'Rain', prompt: 'Heavy rain falling on window' },
  { label: 'Thunder', prompt: 'Distant thunder rumbling' },
  { label: 'Footsteps', prompt: 'Footsteps on wooden floor' },
  { label: 'Door', prompt: 'Wooden door creaking open' },
  { label: 'Whoosh', prompt: 'Quick whoosh transition sound' },
  { label: 'Impact', prompt: 'Heavy cinematic impact hit' },
];

const MUSIC_MOODS = [
  'Epic & Cinematic', 'Tense & Suspenseful', 'Happy & Uplifting',
  'Sad & Melancholic', 'Mysterious & Eerie', 'Action & Intense',
];

const MUSIC_GENRES = [
  'Orchestral', 'Electronic', 'Ambient', 'Rock', 'Synthwave', 'Acoustic',
];

const getAudioModelLabel = (type: GeneratedAudio['type']) => {
  switch (type) {
    case 'voiceover':
      return 'elevenlabs-tts';
    case 'sfx':
      return 'elevenlabs-sfx';
    case 'music':
      return 'elevenlabs-music';
    default:
      return 'elevenlabs';
  }
};

export function SoundSection({
  sceneId,
  isOpen = false,
  onToggle
}: SoundSectionProps) {
  const [activeTab, setActiveTab] = useState('voiceover');
  const [voiceoverText, setVoiceoverText] = useState('');
  const [sfxPrompt, setSfxPrompt] = useState('');
  const [sfxDuration, setSfxDuration] = useState(5);
  const [musicMood, setMusicMood] = useState('');
  const [musicGenre, setMusicGenre] = useState('');
  const [musicCustom, setMusicCustom] = useState('');
  const [musicDuration, setMusicDuration] = useState(30);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId?: string }>();
  const { saveAsset, isSaving } = useSaveToProjectAssets(projectId);

  const generateVoiceover = async () => {
    if (!voiceoverText.trim()) {
      toast.error('Please enter text for the voiceover');
      return;
    }

    const tempId = crypto.randomUUID();
    setIsGenerating(true);
    setGeneratedAudios(prev => [...prev, {
      id: tempId,
      prompt: voiceoverText,
      status: 'generating',
      type: 'voiceover'
    }]);

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({
            text: voiceoverText,
            voiceId: 'JBFqnCBsd6RMkjVDRZzb'
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate voiceover');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'ready', audioUrl } : a
      ));
      toast.success('Voiceover generated!');
      setVoiceoverText('');
    } catch (err) {
      console.error('Voiceover generation failed:', err);
      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'failed' } : a
      ));
      toast.error('Failed to generate voiceover');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSfx = async (prompt: string, duration: number) => {
    if (!prompt.trim()) {
      toast.error('Please enter a sound effect description');
      return;
    }

    const tempId = crypto.randomUUID();
    setIsGenerating(true);
    setGeneratedAudios(prev => [...prev, {
      id: tempId,
      prompt,
      status: 'generating',
      type: 'sfx'
    }]);

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-sfx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({ prompt, duration }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate SFX');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'ready', audioUrl } : a
      ));
      toast.success('Sound effect generated!');
      setSfxPrompt('');
    } catch (err) {
      console.error('SFX generation failed:', err);
      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'failed' } : a
      ));
      toast.error('Failed to generate sound effect');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMusic = async () => {
    const parts = [];
    if (musicMood) parts.push(musicMood.toLowerCase());
    if (musicGenre) parts.push(`${musicGenre.toLowerCase()} style`);
    if (musicCustom) parts.push(musicCustom);
    
    const prompt = parts.length > 0 
      ? parts.join(', ') + ' background music for film/video'
      : 'Cinematic background music';

    const tempId = crypto.randomUUID();
    setIsGenerating(true);
    setGeneratedAudios(prev => [...prev, {
      id: tempId,
      prompt,
      status: 'generating',
      type: 'music'
    }]);

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({ prompt, duration: musicDuration }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate music');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'ready', audioUrl } : a
      ));
      toast.success('Music generated!');
      setMusicCustom('');
    } catch (err) {
      console.error('Music generation failed:', err);
      setGeneratedAudios(prev => prev.map(a =>
        a.id === tempId ? { ...a, status: 'failed' } : a
      ));
      toast.error('Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (audio: GeneratedAudio) => {
    if (!audio.audioUrl) return;

    if (playingId === audio.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audio.audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(audio.id);
    }
  };

  const deleteAudio = (id: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    setGeneratedAudios(prev => prev.filter(a => a.id !== id));
  };

  const filteredAudios = (type: 'voiceover' | 'sfx' | 'music') =>
    generatedAudios.filter(a => a.type === type);

  const handleSaveAudio = useCallback(async (audio: GeneratedAudio) => {
    if (!audio.audioUrl) {
      toast.error('Audio is not ready yet.');
      return;
    }

    await saveAsset({
      url: audio.audioUrl,
      type: 'audio',
      prompt: audio.prompt,
      model: getAudioModelLabel(audio.type),
    });
  }, [saveAsset]);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="space-y-2 pt-3 border-t border-white/5">
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
            <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Music className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Sound & Audio</span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </motion.div>
        </motion.div>
      </CollapsibleTrigger>

      <AnimatePresence initial={false}>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-5 pt-2"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 h-8">
                  <TabsTrigger value="voiceover" className="text-xs data-[state=active]:bg-green-600/20">
                    <Mic className="w-3 h-3 mr-1" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger value="sfx" className="text-xs data-[state=active]:bg-green-600/20">
                    <Volume2 className="w-3 h-3 mr-1" />
                    SFX
                  </TabsTrigger>
                  <TabsTrigger value="music" className="text-xs data-[state=active]:bg-green-600/20">
                    <Music className="w-3 h-3 mr-1" />
                    Music
                  </TabsTrigger>
                </TabsList>

                {/* Voiceover Tab */}
                <TabsContent value="voiceover" className="space-y-3 mt-2">
                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Text to Speech</Label>
                    <Textarea
                      value={voiceoverText}
                      onChange={(e) => setVoiceoverText(e.target.value)}
                      placeholder="Enter text to convert to speech..."
                      className="text-sm min-h-[80px] bg-zinc-900/50 border-zinc-800/50"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={generateVoiceover}
                    disabled={isGenerating || !voiceoverText.trim()}
                    className="w-full h-9 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Generate Voiceover
                  </Button>

                  {filteredAudios('voiceover').length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-500">Generated</Label>
                      {filteredAudios('voiceover').map(audio => (
                        <AudioItem
                          key={audio.id}
                          audio={audio}
                          isPlaying={playingId === audio.id}
                          onPlay={() => playAudio(audio)}
                          onDelete={() => deleteAudio(audio.id)}
                          onSave={() => handleSaveAudio(audio)}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* SFX Tab */}
                <TabsContent value="sfx" className="space-y-3 mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Quick Presets</Label>
                    <div className="flex flex-wrap gap-1">
                      {SFX_PRESETS.map(preset => (
                        <Button
                          key={preset.label}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => generateSfx(preset.prompt, 5)}
                          disabled={isGenerating}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Custom SFX</Label>
                    <Textarea
                      value={sfxPrompt}
                      onChange={(e) => setSfxPrompt(e.target.value)}
                      placeholder="Describe the sound effect..."
                      className="text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                      rows={2}
                    />
                    <div className="mt-2">
                      <Label className="text-xs text-zinc-500">Duration: {sfxDuration}s</Label>
                      <Slider
                        value={[sfxDuration]}
                        onValueChange={([v]) => setSfxDuration(v)}
                        min={1}
                        max={22}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => generateSfx(sfxPrompt, sfxDuration)}
                    disabled={isGenerating || !sfxPrompt.trim()}
                    className="w-full h-9 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Generate SFX
                  </Button>

                  {filteredAudios('sfx').length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-500">Generated</Label>
                      {filteredAudios('sfx').map(audio => (
                        <AudioItem
                          key={audio.id}
                          audio={audio}
                          isPlaying={playingId === audio.id}
                          onPlay={() => playAudio(audio)}
                          onDelete={() => deleteAudio(audio.id)}
                          onSave={() => handleSaveAudio(audio)}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Music Tab */}
                <TabsContent value="music" className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-zinc-400">Mood</Label>
                      <Select value={musicMood} onValueChange={setMusicMood}>
                        <SelectTrigger className="h-8 text-xs bg-zinc-900/50">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSIC_MOODS.map(m => (
                            <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400">Genre</Label>
                      <Select value={musicGenre} onValueChange={setMusicGenre}>
                        <SelectTrigger className="h-8 text-xs bg-zinc-900/50">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSIC_GENRES.map(g => (
                            <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Details</Label>
                    <Textarea
                      value={musicCustom}
                      onChange={(e) => setMusicCustom(e.target.value)}
                      placeholder="Instruments, tempo..."
                      className="text-sm min-h-[50px] bg-zinc-900/50 border-zinc-800/50"
                      rows={2}
                    />
                    <div className="mt-2">
                      <Label className="text-xs text-zinc-500">Duration: {musicDuration}s</Label>
                      <Slider
                        value={[musicDuration]}
                        onValueChange={([v]) => setMusicDuration(v)}
                        min={10}
                        max={120}
                        step={10}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateMusic}
                    disabled={isGenerating}
                    className="w-full h-9 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Generate Music
                  </Button>

                  {filteredAudios('music').length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-zinc-500">Generated</Label>
                      {filteredAudios('music').map(audio => (
                        <AudioItem
                          key={audio.id}
                          audio={audio}
                          isPlaying={playingId === audio.id}
                          onPlay={() => playAudio(audio)}
                          onDelete={() => deleteAudio(audio.id)}
                          onSave={() => handleSaveAudio(audio)}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-3 p-2 bg-blue-950/20 border border-blue-500/20 rounded-md">
                <p className="text-xs text-blue-400">
                  🎵 Powered by ElevenLabs
                </p>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

function AudioItem({
  audio,
  isPlaying,
  onPlay,
  onDelete,
  onSave,
  isSaving
}: {
  audio: GeneratedAudio;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={onPlay}
        disabled={audio.status !== 'ready'}
      >
        {audio.status === 'generating' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : audio.status === 'failed' ? (
          <span className="text-red-400 text-xs">!</span>
        ) : isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      <span className="flex-1 text-xs text-zinc-300 truncate">{audio.prompt}</span>
      {audio.status === 'ready' && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[10px] text-zinc-400 hover:text-zinc-200"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          Save to Project
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-zinc-500 hover:text-red-400"
        onClick={onDelete}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
