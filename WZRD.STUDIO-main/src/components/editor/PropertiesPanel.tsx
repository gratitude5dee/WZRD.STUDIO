import React from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

const PropertiesPanel = () => {
  const { 
    clips, 
    audioTracks, 
    selectedClipIds, 
    selectedAudioTrackIds,
    updateClip,
    updateAudioTrack,
  } = useVideoEditor();

  // Get the first selected item (for now, single selection)
  const selectedClip = clips.find(c => selectedClipIds.includes(c.id));
  const selectedAudio = audioTracks.find(a => selectedAudioTrackIds.includes(a.id));
  const selectedItem = selectedClip || selectedAudio;

  const [aspectLocked, setAspectLocked] = React.useState(true);

  if (!selectedItem) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-center">
        <div className="text-zinc-400">
          <p className="text-sm">No item selected</p>
          <p className="text-xs mt-1 opacity-70">Select a clip or audio track to edit properties</p>
        </div>
      </div>
    );
  }

  const isClip = 'transforms' in selectedItem;

  // For clips (video/image) - show transform controls
  if (isClip && selectedClip) {
    const { transforms } = selectedClip;

    const updateTransform = (key: string, value: any) => {
      updateClip(selectedClip.id, {
        ...selectedClip,
        transforms: {
          ...transforms,
          [key]: value,
        },
      });
    };

    const updatePosition = (axis: 'x' | 'y', value: number) => {
      updateTransform('position', { ...transforms.position, [axis]: value });
    };

    const updateScale = (axis: 'x' | 'y', value: number) => {
      if (aspectLocked) {
        updateTransform('scale', { x: value, y: value });
      } else {
        updateTransform('scale', { ...transforms.scale, [axis]: value });
      }
    };

    return (
      <div className="p-4 space-y-6 h-full overflow-auto">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-zinc-200">Transform</h3>
          
          {/* Position */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-400">Position X</Label>
              <Input
                type="number"
                value={transforms.position.x}
                onChange={(e) => updatePosition('x', parseFloat(e.target.value) || 0)}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Position Y</Label>
              <Input
                type="number"
                value={transforms.position.y}
                onChange={(e) => updatePosition('y', parseFloat(e.target.value) || 0)}
                className="h-8 mt-1"
              />
            </div>
          </div>

          {/* Scale */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Scale</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAspectLocked(!aspectLocked)}
                className="h-6 w-6 p-0"
              >
                {aspectLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Scale {aspectLocked ? '' : 'X'}</Label>
              <Slider
                value={[transforms.scale.x]}
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={([value]) => updateScale('x', value)}
                className="mt-2"
              />
              <span className="text-xs text-zinc-500">{transforms.scale.x.toFixed(2)}x</span>
            </div>
            {!aspectLocked && (
              <div>
                <Label className="text-xs text-zinc-400">Scale Y</Label>
                <Slider
                  value={[transforms.scale.y]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => updateScale('y', value)}
                  className="mt-2"
                />
                <span className="text-xs text-zinc-500">{transforms.scale.y.toFixed(2)}x</span>
              </div>
            )}
          </div>

          {/* Rotation */}
          <div className="mt-4">
            <Label className="text-xs text-zinc-400">Rotation</Label>
            <Slider
              value={[transforms.rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([value]) => updateTransform('rotation', value)}
              className="mt-2"
            />
            <span className="text-xs text-zinc-500">{transforms.rotation}°</span>
          </div>

          {/* Opacity */}
          <div className="mt-4">
            <Label className="text-xs text-zinc-400">Opacity</Label>
            <Slider
              value={[transforms.opacity * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => updateTransform('opacity', value / 100)}
              className="mt-2"
            />
            <span className="text-xs text-zinc-500">{Math.round(transforms.opacity * 100)}%</span>
          </div>
        </div>

        {/* Timing */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-zinc-200">Timing</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-400">Start Time (s)</Label>
              <Input
                type="number"
                value={selectedClip.startTime}
                onChange={(e) => updateClip(selectedClip.id, { 
                  ...selectedClip, 
                  startTime: parseFloat(e.target.value) || 0 
                })}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Duration (s)</Label>
              <Input
                type="number"
                value={selectedClip.duration}
                onChange={(e) => updateClip(selectedClip.id, { 
                  ...selectedClip, 
                  duration: parseFloat(e.target.value) || 1 
                })}
                className="h-8 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For audio tracks - show audio controls
  if (selectedAudio) {
    return (
      <div className="p-4 space-y-6 h-full overflow-auto">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-zinc-200">Audio Properties</h3>
          
          {/* Volume */}
          <div className="mt-4">
            <Label className="text-xs text-zinc-400">Volume</Label>
            <Slider
              value={[selectedAudio.volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => updateAudioTrack(selectedAudio.id, { 
                ...selectedAudio,
                volume: value / 100 
              })}
              className="mt-2"
            />
            <span className="text-xs text-zinc-500">{Math.round(selectedAudio.volume * 100)}%</span>
          </div>
        </div>

        {/* Timing */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-zinc-200">Timing</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-400">Start Time (s)</Label>
              <Input
                type="number"
                value={selectedAudio.startTime}
                onChange={(e) => updateAudioTrack(selectedAudio.id, { 
                  ...selectedAudio,
                  startTime: parseFloat(e.target.value) || 0 
                })}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-label text-zinc-400">Duration (s)</Label>
              <Input
                type="number"
                value={selectedAudio.duration}
                onChange={(e) => updateAudioTrack(selectedAudio.id, { 
                  ...selectedAudio,
                  duration: parseFloat(e.target.value) || 1 
                })}
                className="h-8 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PropertiesPanel;