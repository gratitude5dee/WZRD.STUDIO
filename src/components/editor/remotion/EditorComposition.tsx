import { CSSProperties, useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, Video, useCurrentFrame, useVideoConfig } from 'remotion';
import { AudioTrack, Clip, CompositionSettings, Keyframe } from '@/store/videoEditorStore';

interface EditorCompositionProps {
  clips: Clip[];
  audioTracks: AudioTrack[];
  composition: CompositionSettings;
  selectedClipIds?: string[];
  keyframes: Keyframe[];
}

const msToFrames = (ms: number, fps: number) => Math.max(1, Math.round((ms / 1000) * fps));
const msToStartFrame = (ms: number, fps: number) => Math.max(0, Math.floor((ms / 1000) * fps));

export function EditorComposition({ clips, audioTracks, composition, selectedClipIds = [], keyframes }: EditorCompositionProps) {
  const fps = composition.fps;
  const sortedClips = useMemo(
    () => [...clips].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)),
    [clips]
  );
  const sortedAudio = useMemo(
    () => [...audioTracks].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)),
    [audioTracks]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: composition.backgroundColor }}>
      {sortedClips.map((clip) => {
        const from = msToStartFrame(clip.startTime ?? 0, fps);
        const duration = msToFrames(clip.duration ?? 1000, fps);

        return (
          <Sequence key={clip.id} from={from} durationInFrames={duration}>
            <ClipLayer
              clip={clip}
              keyframes={keyframes.filter((kf) => kf.targetId === clip.id)}
              isSelected={selectedClipIds.includes(clip.id)}
            />
          </Sequence>
        );
      })}

      {sortedAudio.map((track) => {
        const from = msToStartFrame(track.startTime ?? 0, fps);
        const duration = msToFrames(track.duration ?? 1000, fps);
        const fadeInFrames = msToFrames(track.fadeInDuration ?? 0, fps);
        const fadeOutFrames = msToFrames(track.fadeOutDuration ?? 0, fps);
        return (
          <Sequence key={track.id} from={from} durationInFrames={duration}>
            <Audio
              src={track.url}
              volume={(frame) => {
                if (track.isMuted) return 0;
                const localFrame = frame;
                let volume = track.volume ?? 1;
                if (fadeInFrames > 0 && localFrame < fadeInFrames) {
                  volume *= localFrame / fadeInFrames;
                }
                if (fadeOutFrames > 0) {
                  const remaining = duration - localFrame;
                  if (remaining < fadeOutFrames) {
                    volume *= Math.max(0, remaining / fadeOutFrames);
                  }
                }
                return volume;
              }}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

interface ClipLayerProps {
  clip: Clip;
  keyframes: Keyframe[];
  isSelected: boolean;
}

const ClipLayer = ({ clip, keyframes, isSelected }: ClipLayerProps) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const absoluteTimeMs = (frame / config.fps) * 1000 + (clip.startTime ?? 0);
  const transform = getTransformForTime(clip, keyframes, absoluteTimeMs);
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `translate(${transform.position.x}px, ${transform.position.y}px) scale(${transform.scale.x}, ${transform.scale.y}) rotate(${transform.rotation}deg)`,
    opacity: transform.opacity,
    boxShadow: isSelected ? '0 0 0 3px rgba(155,135,245,0.8)' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  return clip.type === 'video' ? <Video src={clip.url} style={style} /> : <Img src={clip.url} style={style} />;
};

const getTransformForTime = (clip: Clip, keyframes: Keyframe[], time: number) => {
  if (keyframes.length === 0) {
    return clip.transforms;
  }
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const previous = [...sorted].reverse().find((kf) => kf.time <= time);
  const next = sorted.find((kf) => kf.time >= time && kf !== previous);
  const prevTransform = (previous?.properties.transforms as Clip['transforms']) ?? clip.transforms;
  const nextTransform = (next?.properties.transforms as Clip['transforms']) ?? prevTransform;
  if (!next) {
    return prevTransform;
  }
  const range = Math.max(1, next.time - (previous?.time ?? 0));
  const progress = Math.max(0, Math.min(1, (time - (previous?.time ?? 0)) / range));
  const lerp = (start: number, end: number) => start + (end - start) * progress;
  return {
    position: {
      x: lerp(prevTransform.position.x, nextTransform.position.x),
      y: lerp(prevTransform.position.y, nextTransform.position.y),
    },
    scale: {
      x: lerp(prevTransform.scale.x, nextTransform.scale.x),
      y: lerp(prevTransform.scale.y, nextTransform.scale.y),
    },
    rotation: lerp(prevTransform.rotation, nextTransform.rotation),
    opacity: lerp(prevTransform.opacity, nextTransform.opacity),
  };
};
