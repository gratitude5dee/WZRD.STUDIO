
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, PauseCircle, Loader2, Mic } from 'lucide-react';
import { AudioStatus } from '@/types/storyboardTypes';

interface ShotAudioProps {
  audioUrl: string | null;
  status: AudioStatus;
  isGenerating: boolean;
  hasDialogue: boolean;
  onGenerateAudio: () => Promise<void>;
}

const ShotAudio: React.FC<ShotAudioProps> = ({
  audioUrl,
  status,
  isGenerating,
  hasDialogue,
  onGenerateAudio
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Set up audio element if there's a URL
  React.useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  };

  // No UI if no dialogue
  if (!hasDialogue) {
    return null;
  }

  // Pending/failed states
  if (!audioUrl || status === 'failed') {
    return (
      <div className="mt-1 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 p-1 h-auto"
          onClick={onGenerateAudio}
          disabled={isGenerating || !hasDialogue}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating Audio...
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 mr-1" />
              {status === 'failed' ? 'Retry Audio Generation' : 'Generate Audio'}
            </>
          )}
        </Button>
      </div>
    );
  }

  // Completed state with audio player
  return (
    <div className="mt-1 flex justify-between items-center border-t border-zinc-700/30 pt-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs p-1 h-6 text-purple-300 hover:text-purple-200 hover:bg-purple-950/20"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <>
            <PauseCircle className="w-3 h-3 mr-1" />
            Pause Audio
          </>
        ) : (
          <>
            <PlayCircle className="w-3 h-3 mr-1" />
            Play Audio
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/20 p-1 h-6"
        onClick={onGenerateAudio}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Mic className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};

export default ShotAudio;
