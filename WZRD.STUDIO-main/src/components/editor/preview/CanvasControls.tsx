import { Trash2, Scissors, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function CanvasControls() {
  const selectedClipIds = useVideoEditorStore((s) => s.selectedClipIds);
  const selectedAudioTrackIds = useVideoEditorStore((s) => s.selectedAudioTrackIds);
  const removeClip = useVideoEditorStore((s) => s.removeClip);
  const removeAudioTrack = useVideoEditorStore((s) => s.removeAudioTrack);
  const clips = useVideoEditorStore((s) => s.clips);
  const audioTracks = useVideoEditorStore((s) => s.audioTracks);
  const addClip = useVideoEditorStore((s) => s.addClip);
  const addAudioTrack = useVideoEditorStore((s) => s.addAudioTrack);
  const playback = useVideoEditorStore((s) => s.playback);
  
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const hasSelection = selectedClipIds.length > 0 || selectedAudioTrackIds.length > 0;

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setClickedButton(buttonId);
    action();
    setTimeout(() => setClickedButton(null), 200);
  };

  const handleDelete = () => {
    if (!hasSelection) {
      toast.error('No clips selected');
      return;
    }

    selectedClipIds.forEach(id => removeClip(id));
    selectedAudioTrackIds.forEach(id => removeAudioTrack(id));
    
    toast.success(`Deleted ${selectedClipIds.length + selectedAudioTrackIds.length} item(s)`);
  };

  const handleSplit = () => {
    if (selectedClipIds.length === 0) {
      toast.error('Select a clip to split');
      return;
    }

    const clipId = selectedClipIds[0];
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const splitTime = playback.currentTime;
    if (splitTime <= clip.startTime || splitTime >= (clip.startTime + clip.duration)) {
      toast.error('Playhead must be inside the clip');
      return;
    }

    // Create two new clips from the split
    const firstDuration = splitTime - clip.startTime;
    const secondDuration = clip.duration - firstDuration;

    const firstClip = {
      ...clip,
      id: crypto.randomUUID(),
      duration: firstDuration,
    };

    const secondClip = {
      ...clip,
      id: crypto.randomUUID(),
      startTime: splitTime,
      duration: secondDuration,
    };

    removeClip(clipId);
    addClip(firstClip);
    addClip(secondClip);

    toast.success('Clip split successfully');
  };

  const handleClone = () => {
    if (!hasSelection) {
      toast.error('No clips selected');
      return;
    }

    let clonedCount = 0;

    selectedClipIds.forEach(id => {
      const clip = clips.find(c => c.id === id);
      if (clip) {
        const clonedClip = {
          ...clip,
          id: crypto.randomUUID(),
          startTime: clip.startTime + clip.duration + 100, // Offset by duration + 100ms
        };
        addClip(clonedClip);
        clonedCount++;
      }
    });

    selectedAudioTrackIds.forEach(id => {
      const track = audioTracks.find(t => t.id === id);
      if (track) {
        const clonedTrack = {
          ...track,
          id: crypto.randomUUID(),
          startTime: track.startTime + track.duration + 100,
        };
        addAudioTrack(clonedTrack);
        clonedCount++;
      }
    });

    toast.success(`Cloned ${clonedCount} item(s)`);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              animate={clickedButton === 'delete' ? { scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleButtonClick('delete', handleDelete)}
                disabled={!hasSelection}
                className="text-white/70 hover:text-white hover:bg-white/5 gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <p className="text-xs">Delete selected clips</p>
            <kbd className="text-[10px] px-1.5 py-0.5 mt-1 bg-black/30 rounded inline-block">Backspace</kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              animate={clickedButton === 'split' ? { scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleButtonClick('split', handleSplit)}
                disabled={selectedClipIds.length === 0}
                className="text-white/70 hover:text-white hover:bg-white/5 gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Scissors className="w-4 h-4" />
                <span>Split</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <p className="text-xs">Split clip at playhead</p>
            <kbd className="text-[10px] px-1.5 py-0.5 mt-1 bg-black/30 rounded inline-block">S</kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              animate={clickedButton === 'clone' ? { scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleButtonClick('clone', handleClone)}
                disabled={!hasSelection}
                className="text-white/70 hover:text-white hover:bg-white/5 gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                <span>Clone</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <p className="text-xs">Duplicate selected clips</p>
            <kbd className="text-[10px] px-1.5 py-0.5 mt-1 bg-black/30 rounded inline-block">Ctrl+D</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
