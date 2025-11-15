import { useVideoEditorStore } from '@/store/videoEditorStore';
import { PropertySection } from './PropertySection';
import { ColorPicker } from './ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PropertiesPanelProps {
  selectedClipIds: string[];
  selectedAudioTrackIds: string[];
}

export default function PropertiesPanel({ selectedClipIds, selectedAudioTrackIds }: PropertiesPanelProps) {
  const clips = useVideoEditorStore((s) => s.clips);
  const audioTracks = useVideoEditorStore((s) => s.audioTracks);

  const selectedClip = selectedClipIds.length === 1 ? clips.find(c => c.id === selectedClipIds[0]) : null;
  const selectedAudioTrack = selectedAudioTrackIds.length === 1 ? audioTracks.find(t => t.id === selectedAudioTrackIds[0]) : null;

  if (!selectedClip && !selectedAudioTrack) {
    return (
      <div className="w-80 bg-[#0a0a0a] border-l border-[#2a2a2a] flex items-center justify-center">
        <p className="text-white/50 text-sm">Select a clip to edit properties</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0a0a0a] border-l border-[#2a2a2a] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <h2 className="text-white font-semibold text-lg">
          {selectedClip ? 'CaptionXX' : 'Audio Properties'}
        </h2>
      </div>

      {/* Caption Properties */}
      {selectedClip && (
        <>
          {/* Preset */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <Label className="text-sm text-white/70 mb-2 block">Preset</Label>
            <Select defaultValue="none">
              <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="preset1">Preset 1</SelectItem>
                <SelectItem value="preset2">Preset 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Words Section */}
          <PropertySection title="Words">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-white/70 mb-2 block">Lines per Page</Label>
                <Select defaultValue="one">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="one">One</SelectItem>
                    <SelectItem value="two">Two</SelectItem>
                    <SelectItem value="three">Three</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Words per line</Label>
                <Select defaultValue="punctuation">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="punctuation">Punctuation</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Words in line</Label>
                <Select defaultValue="page">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Position</Label>
                <Select defaultValue="auto">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Transition</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PropertySection>

          {/* Animations Section */}
          <PropertySection title="Animations">
            <div>
              <Label className="text-sm text-white/70 mb-2 block">Animation</Label>
              <Select defaultValue="none">
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PropertySection>

          {/* Colors Section */}
          <PropertySection title="Colors">
            <div className="space-y-3">
              <ColorPicker
                label="Appeared"
                value="#FFFFFF"
                onChange={() => {}}
              />

              <ColorPicker
                label="Active"
                value="#50FF12"
                onChange={() => {}}
              />

              <ColorPicker
                label="Active Fill"
                value="#7E12FF"
                onChange={() => {}}
              />

              <ColorPicker
                label="Emphasize"
                value="transparent"
                onChange={() => {}}
              />

              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Preserved Color</Label>
                <Switch />
              </div>
            </div>
          </PropertySection>

          {/* Styles Section */}
          <PropertySection title="Styles">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-white/70 mb-2 block">Font</Label>
                <Select defaultValue="opensans">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Weight</Label>
                <Select defaultValue="regular">
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Size</Label>
                <Input
                  type="number"
                  defaultValue={64}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                />
              </div>

              <ColorPicker
                label="Color"
                value="#D3D3D3"
                onChange={() => {}}
              />
            </div>
          </PropertySection>
        </>
      )}

      {/* Audio Track Properties */}
      {selectedAudioTrack && (
        <PropertySection title="Audio">
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-white/70 mb-2 block">Volume</Label>
              <Input
                type="number"
                min={0}
                max={100}
                defaultValue={Math.round(selectedAudioTrack.volume * 100)}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/70">Muted</Label>
              <Switch checked={selectedAudioTrack.isMuted} />
            </div>
          </div>
        </PropertySection>
      )}
    </div>
  );
}
