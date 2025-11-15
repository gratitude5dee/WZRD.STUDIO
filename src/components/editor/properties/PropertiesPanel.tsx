import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { useVideoEditorStore, Clip } from '@/store/videoEditorStore';

interface PropertiesPanelProps {
  selectedClipIds: string[];
  selectedAudioTrackIds: string[];
}

export default function PropertiesPanel({ selectedClipIds, selectedAudioTrackIds }: PropertiesPanelProps) {
  const primaryClipId = selectedClipIds[0] ?? null;
  const primaryAudioId = selectedAudioTrackIds[0] ?? null;
  
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const allKeyframes = useVideoEditorStore((state) => state.keyframes);
  const updateClip = useVideoEditorStore((state) => state.updateClip);
  const updateAudioTrack = useVideoEditorStore((state) => state.updateAudioTrack);
  const playback = useVideoEditorStore((state) => state.playback);
  const addKeyframe = useVideoEditorStore((state) => state.addKeyframe);
  const removeKeyframe = useVideoEditorStore((state) => state.removeKeyframe);
  
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

  const handleAddKeyframe = (clipId: string) => {
    addKeyframe({
      id: uuidv4(),
      targetId: clipId,
      time: playback.currentTime,
      properties: clip?.transforms || {},
    });
  };

  if (!clip && !audioTrack) {
    return (
      <div className="w-[320px] h-full bg-card border-l border-border flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a clip or audio track to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-full bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          {clip ? clip.name : audioTrack?.name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {clip ? 'Video/Image Clip' : 'Audio Track'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {clip && (
            <Accordion type="multiple" defaultValue={['basic', 'transform']} className="space-y-2">
              <AccordionItem value="basic" className="border border-border rounded-lg bg-muted/20">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="text-sm font-medium">Basic</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      className="mt-1.5 h-9 bg-background border-border"
                      value={clip.name}
                      onChange={(event) => updateClip(clip.id, { name: event.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={clip.startTime}
                        onChange={(event) => updateClip(clip.id, { startTime: Number(event.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Duration (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={clip.duration}
                        onChange={(event) => updateClip(clip.id, { duration: Number(event.target.value) })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {transformValues && (
                <AccordionItem value="transform" className="border border-border rounded-lg bg-muted/20">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <span className="text-sm font-medium">Transform</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Position</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">X</Label>
                          <Input
                            type="number"
                            className="mt-1 h-9 bg-background border-border"
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
                          <Label className="text-[10px] text-muted-foreground">Y</Label>
                          <Input
                            type="number"
                            className="mt-1 h-9 bg-background border-border"
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
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Scale</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">X</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="mt-1 h-9 bg-background border-border"
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
                          <Label className="text-[10px] text-muted-foreground">Y</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="mt-1 h-9 bg-background border-border"
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
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Rotation (degrees)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={transformValues.rotation}
                        onChange={(event) => handleTransformChange('rotation', Number(event.target.value))}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Opacity</Label>
                        <span className="text-xs text-foreground">{(transformValues.opacity * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[transformValues.opacity]}
                        onValueChange={(value) => handleTransformChange('opacity', value[0])}
                        className="mt-1.5"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="keyframes" className="border border-border rounded-lg bg-muted/20">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="text-sm font-medium">Keyframes</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Current: {formatTime(playback.currentTime)}</p>
                    <Button size="sm" variant="outline" onClick={() => handleAddKeyframe(clip.id)} className="h-8">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {sortedKeyframes.length === 0 && (
                      <p className="text-xs text-muted-foreground">No keyframes yet.</p>
                    )}
                    {sortedKeyframes.map((keyframe) => (
                      <div
                        key={keyframe.id}
                        className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2"
                      >
                        <span className="text-xs text-foreground">{formatTime(keyframe.time)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => removeKeyframe(keyframe.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {audioTrack && (
            <Accordion type="multiple" defaultValue={['audio']} className="space-y-2">
              <AccordionItem value="audio" className="border border-border rounded-lg bg-muted/20">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="text-sm font-medium">Audio</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      className="mt-1.5 h-9 bg-background border-border"
                      value={audioTrack.name}
                      onChange={(event) => updateAudioTrack(audioTrack.id, { name: event.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={audioTrack.startTime}
                        onChange={(event) => updateAudioTrack(audioTrack.id, { startTime: Number(event.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Duration (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={audioTrack.duration}
                        onChange={(event) => updateAudioTrack(audioTrack.id, { duration: Number(event.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Volume</Label>
                      <span className="text-xs text-foreground">{(audioTrack.volume * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[audioTrack.volume]}
                      onValueChange={(value) => updateAudioTrack(audioTrack.id, { volume: value[0] })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Muted</Label>
                    <Switch
                      checked={audioTrack.isMuted}
                      onCheckedChange={(checked) => updateAudioTrack(audioTrack.id, { isMuted: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Fade In (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={audioTrack.fadeInDuration}
                        onChange={(event) => updateAudioTrack(audioTrack.id, { fadeInDuration: Number(event.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fade Out (ms)</Label>
                      <Input
                        type="number"
                        className="mt-1.5 h-9 bg-background border-border"
                        value={audioTrack.fadeOutDuration}
                        onChange={(event) => updateAudioTrack(audioTrack.id, { fadeOutDuration: Number(event.target.value) })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
