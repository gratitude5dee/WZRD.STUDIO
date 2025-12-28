import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown, Mic, Volume2, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SoundSectionProps {
  sceneId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SoundSection({
  sceneId,
  isOpen = false,
  onToggle
}: SoundSectionProps) {
  const [activeTab, setActiveTab] = useState('voiceover');
  const [voiceoverNotes, setVoiceoverNotes] = useState('');
  const [sfxNotes, setSfxNotes] = useState('');
  const [musicNotes, setMusicNotes] = useState('');

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
            <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center
              shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Music className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Sound & Audio</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
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
                    Voiceover
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
                <TabsContent value="voiceover" className="space-y-2 mt-2">
                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Voiceover Notes</Label>
                    <Textarea
                      value={voiceoverNotes}
                      onChange={(e) => setVoiceoverNotes(e.target.value)}
                      placeholder="Describe voiceover requirements for this scene..."
                      className="text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                      rows={2}
                    />
                    <div className="mt-2 text-xs text-zinc-500">
                      <p>💡 Tip: Voiceover will be generated using ElevenLabs TTS based on dialogue and character voice assignments.</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Generate Voiceovers (Coming Soon)
                  </Button>
                </TabsContent>

                {/* SFX Tab */}
                <TabsContent value="sfx" className="space-y-2 mt-2">
                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Sound Effects</Label>
                    <Textarea
                      value={sfxNotes}
                      onChange={(e) => setSfxNotes(e.target.value)}
                      placeholder='E.g., "Footsteps on gravel, distant siren, door creaking open..."'
                      className="text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                      rows={2}
                    />
                    <div className="mt-2 text-xs text-zinc-500">
                      <p>💡 Tip: Describe ambient sounds and specific sound effects needed for this scene.</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Generate SFX (Coming Soon)
                  </Button>
                </TabsContent>

                {/* Music Tab */}
                <TabsContent value="music" className="space-y-2 mt-2">
                  <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <Label className="text-xs text-zinc-400 mb-2 block">Background Music</Label>
                    <Textarea
                      value={musicNotes}
                      onChange={(e) => setMusicNotes(e.target.value)}
                      placeholder="Describe the mood and style of music... e.g., 'Tense orchestral, building suspense...'"
                      className="text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                      rows={2}
                    />
                    <div className="mt-2 text-xs text-zinc-500">
                      <p>💡 Tip: Specify mood (epic, tense, romantic) and genre (orchestral, electronic, jazz).</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Generate Music (Coming Soon)
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Info box */}
              <div className="mt-3 p-2 bg-blue-950/20 border border-blue-500/20 rounded-md">
                <p className="text-xs text-blue-400">
                  🎵 Audio generation powered by ElevenLabs (TTS, SFX, Music)
                </p>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
