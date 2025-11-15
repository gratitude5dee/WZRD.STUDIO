import { useMemo } from 'react';
import { AudioTrack } from '@/store/videoEditorStore';

interface WaveformRendererProps {
  track: AudioTrack;
}

const BAR_COUNT = 80;

export function WaveformRenderer({ track }: WaveformRendererProps) {
  const bars = useMemo(() => {
    const seed = track.id;
    const values: number[] = [];
    for (let i = 0; i < BAR_COUNT; i += 1) {
      const charCode = seed.charCodeAt(i % seed.length) ?? 0;
      const value = 20 + ((charCode * (i + 3)) % 60);
      values.push(value);
    }
    return values;
  }, [track.id]);

  return (
    <div className="absolute inset-0 flex items-center gap-[2px] px-2">
      {bars.map((height, index) => (
        <div
          key={`${track.id}-${index}`}
          className="w-0.5 rounded-full bg-[#9b87f5]/70"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
