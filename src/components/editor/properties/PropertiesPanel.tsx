import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useVideoEditorStore, Clip } from '@/store/videoEditorStore';

interface PropertiesPanelProps {
  selectedClipIds: string[];
  selectedAudioTrackIds: string[];
}

export default function PropertiesPanel({ selectedClipIds, selectedAudioTrackIds }: PropertiesPanelProps) {
  const primaryClipId = selectedClipIds[0] ?? null;
  const primaryAudioId = selectedAudioTrackIds[0] ?? null;
  
  // Get full arrays once and filter in useMemo to avoid infinite loops
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const allKeyframes = useVideoEditorStore((state) => state.keyframes);
  const updateClip = useVideoEditorStore((state) => state.updateClip);
  const updateAudioTrack = useVideoEditorStore((state) => state.updateAudioTrack);
  const playback = useVideoEditorStore((state) => state.playback);
  const addKeyframe = useVideoEditorStore((state) => state.addKeyframe);
  const removeKeyframe = useVideoEditorStore((state) => state.removeKeyframe);
  
  // Use useMemo to cache filtered results
  const clip = useMemo(() => clips.find((item) => item.id === primaryClipId) ?? null, [clips, primaryClipId]);
  const audioTrack = useMemo(() => audioTracks.find((item) => item.id === primaryAudioId) ?? null, [audioTracks, primaryAudioId]);
  const sortedKeyframes = useMemo(() => {
    if (!primaryClipId) return [];
    return allKeyframes
      .filter((keyframe) => keyframe.targetId === primaryClipId)
      .sort((a, b) => a.time - b.time);
  }, [allKeyframes, primaryClipId]);

  const transformValues = useMemo(() => {
    if (!clip) return null;
    return {
      position: clip.transforms.position,
      scale: clip.transforms.scale,
      rotation: clip.transforms.rotation,
      opacity: clip.transforms.opacity,
    };
  }, [clip]);

  const handleTransformChange = <T extends keyof Clip['transforms']>(
    key: T,
    value: Clip['transforms'][T]
  ) => {
    if (!clip) return;
    updateClip(clip.id, {
      transforms: {
        ...clip.transforms,
        [key]: value,
      },
    });
  };

  if (!clip && !audioTrack) {
    return (
      <div className="w-[320px] bg-[#0F1117] border-l border-[#1D2130] p-4 text-sm text-[#8E94A8]">
        Select a clip or audio track to edit its properties.
      </div>
    );
  }

  return (
    <div className="w-[320px] bg-[#0F1117] border-l border-[#1D2130] p-4 text-sm space-y-6">
      {clip && (
        <div className="space-y-4">
          <div>
            <p className="text-white font-semibold">Clip Properties</p>
            <p className="text-xs text-[#8E94A8]">Adjust metadata and transforms</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#8E94A8]">Name</Label>
            <Input
              className="bg-[#141826] border-[#1D2130]"
              value={clip.name}
              onChange={(event) => updateClip(clip.id, { name: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-[#8E94A8]">Start (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={clip.startTime}
                onChange={(event) => updateClip(clip.id, { startTime: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs text-[#8E94A8]">Duration (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={clip.duration}
                onChange={(event) => updateClip(clip.id, { duration: Number(event.target.value) })}
              />
            </div>
          </div>

          {transformValues && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[#8E94A8]">Position X</Label>
                  <Input
                    type="number"
                    className="bg-[#141826] border-[#1D2130]"
                    value={transformValues.position.x}
                    onChange={(event) =>
                      handleTransformChange('position', {
                        ...transformValues.position,
                        x: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#8E94A8]">Position Y</Label>
                  <Input
                    type="number"
                    className="bg-[#141826] border-[#1D2130]"
                    value={transformValues.position.y}
                    onChange={(event) =>
                      handleTransformChange('position', {
                        ...transformValues.position,
                        y: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[#8E94A8]">Scale X</Label>
                  <Input
                    type="number"
                    className="bg-[#141826] border-[#1D2130]"
                    value={transformValues.scale.x}
                    onChange={(event) =>
                      handleTransformChange('scale', {
                        ...transformValues.scale,
                        x: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#8E94A8]">Scale Y</Label>
                  <Input
                    type="number"
                    className="bg-[#141826] border-[#1D2130]"
                    value={transformValues.scale.y}
                    onChange={(event) =>
                      handleTransformChange('scale', {
                        ...transformValues.scale,
                        y: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-[#8E94A8]">Rotation</Label>
                <Input
                  type="number"
                  className="bg-[#141826] border-[#1D2130]"
                  value={transformValues.rotation}
                  onChange={(event) => handleTransformChange('rotation', Number(event.target.value))}
                />
              </div>

              <div>
                <Label className="text-xs text-[#8E94A8]">Opacity</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[transformValues.opacity]}
                  onValueChange={(value) => handleTransformChange('opacity', value[0])}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-[#8E94A8]">Keyframes</Label>
                <p className="text-[10px] text-[#8E94A8]">Current time: {formatTime(playback.currentTime)}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleAddKeyframe(clip.id)}>
                Add
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-auto">
              {sortedKeyframes.length === 0 && (
                <p className="text-xs text-[#8E94A8]">No keyframes yet.</p>
              )}
              {sortedKeyframes.map((keyframe) => (
                <div
                  key={keyframe.id}
                  className="flex items-center justify-between bg-[#141826] border border-[#1D2130] rounded px-2 py-1 text-xs"
                >
                  <span>{formatTime(keyframe.time)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-[#8E94A8] hover:text-white"
                    onClick={() => removeKeyframe(keyframe.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {audioTrack && (
        <div className="space-y-4 border-t border-[#1D2130] pt-4">
          <div>
            <p className="text-white font-semibold">Audio Track</p>
            <p className="text-xs text-[#8E94A8]">Volume and fades</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#8E94A8]">Name</Label>
            <Input
              className="bg-[#141826] border-[#1D2130]"
              value={audioTrack.name}
              onChange={(event) => updateAudioTrack(audioTrack.id, { name: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-[#8E94A8]">Start (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={audioTrack.startTime}
                onChange={(event) => updateAudioTrack(audioTrack.id, { startTime: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs text-[#8E94A8]">Duration (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={audioTrack.duration}
                onChange={(event) => updateAudioTrack(audioTrack.id, { duration: Number(event.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-[#8E94A8]">Volume</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[audioTrack.volume]}
              onValueChange={(value) => updateAudioTrack(audioTrack.id, { volume: value[0] })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-[#8E94A8]">Fade In (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={audioTrack.fadeInDuration ?? 0}
                onChange={(event) => updateAudioTrack(audioTrack.id, { fadeInDuration: Number(event.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs text-[#8E94A8]">Fade Out (ms)</Label>
              <Input
                type="number"
                className="bg-[#141826] border-[#1D2130]"
                value={audioTrack.fadeOutDuration ?? 0}
                onChange={(event) => updateAudioTrack(audioTrack.id, { fadeOutDuration: Number(event.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-[#8E94A8]">Mute</Label>
            <Switch
              checked={audioTrack.isMuted}
              onCheckedChange={(checked) => updateAudioTrack(audioTrack.id, { isMuted: checked })}
            />
          </div>
        </div>
      )}
    </div>
  );

  function handleAddKeyframe(targetId: string) {
    if (!clip) return;
    addKeyframe({
      id: uuidv4(),
      targetId,
      time: playback.currentTime,
      properties: { transforms: clip.transforms },
    });
  }
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}.${Math.floor(ms % 1000).toString().padStart(3, '0')}`;
}
