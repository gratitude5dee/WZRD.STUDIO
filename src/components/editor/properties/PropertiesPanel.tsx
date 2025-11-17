import { useVideoEditorStore } from '@/store/videoEditorStore';
import { PropertySection } from './PropertySection';
import { ColorPicker } from './ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';

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
      <div
        className="flex items-center justify-center"
        style={{
          width: `${exactMeasurements.propertiesPanel.width}px`,
          background: editorTheme.bg.secondary,
          borderLeft: `1px solid ${editorTheme.border.subtle}`,
        }}
      >
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: editorTheme.text.tertiary,
          }}
        >
          Select a clip to edit properties
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{
        width: `${exactMeasurements.propertiesPanel.width}px`,
        background: editorTheme.bg.secondary,
        borderLeft: `1px solid ${editorTheme.border.subtle}`,
      }}
    >
      {/* Header - Caption Title */}
      <div
        style={{
          padding: `${exactMeasurements.propertiesPanel.padding}px`,
          borderBottom: `1px solid ${editorTheme.border.subtle}`,
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            color: editorTheme.text.primary,
          }}
        >
          {selectedClip ? selectedClip.name || 'Caption Title' : 'Audio Properties'}
        </h2>
      </div>

      {/* Caption Properties */}
      {selectedClip && (
        <>
          {/* Preset Section */}
          <div
            style={{
              padding: `${exactMeasurements.propertiesPanel.padding}px`,
              borderBottom: `1px solid ${editorTheme.border.subtle}`,
            }}
          >
            <Label
              className="block mb-2"
              style={{
                fontSize: typography.fontSize.sm,
                color: editorTheme.text.secondary,
                marginBottom: '8px',
              }}
            >
              Preset
            </Label>
            <Select defaultValue="none">
              <SelectTrigger
                style={{
                  height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                  background: editorTheme.bg.tertiary,
                  border: `1px solid ${editorTheme.border.default}`,
                  borderRadius: '4px',
                  color: editorTheme.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: editorTheme.bg.tertiary,
                  border: `1px solid ${editorTheme.border.default}`,
                  zIndex: 9999,
                }}
              >
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="preset1">Style 1</SelectItem>
                <SelectItem value="preset2">Style 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Words Section */}
          <PropertySection title="Words">
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${exactMeasurements.propertiesPanel.fieldGap}px` }}>
              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Lines per Page
                </Label>
                <Select defaultValue="one">
                  <SelectTrigger
                    style={{
                      height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                      background: editorTheme.bg.tertiary,
                      border: `1px solid ${editorTheme.border.default}`,
                      borderRadius: '4px',
                      color: editorTheme.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                    <SelectItem value="one">One</SelectItem>
                    <SelectItem value="two">Two</SelectItem>
                    <SelectItem value="three">Three</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Words per line
                </Label>
                <Select defaultValue="punctuation">
                  <SelectTrigger
                    style={{
                      height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                      background: editorTheme.bg.tertiary,
                      border: `1px solid ${editorTheme.border.default}`,
                      borderRadius: '4px',
                      color: editorTheme.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                    <SelectItem value="punctuation">Punctuation</SelectItem>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Position
                </Label>
                <Select defaultValue="auto">
                  <SelectTrigger
                    style={{
                      height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                      background: editorTheme.bg.tertiary,
                      border: `1px solid ${editorTheme.border.default}`,
                      borderRadius: '4px',
                      color: editorTheme.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PropertySection>

          {/* Animations Section */}
          <PropertySection title="Animations">
            <div>
              <Label
                className="block"
                style={{
                  fontSize: typography.fontSize.sm,
                  color: editorTheme.text.secondary,
                  marginBottom: '8px',
                }}
              >
                Animation
              </Label>
              <Select defaultValue="none">
                <SelectTrigger
                  style={{
                    height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                    background: editorTheme.bg.tertiary,
                    border: `1px solid ${editorTheme.border.default}`,
                    borderRadius: '4px',
                    color: editorTheme.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade In</SelectItem>
                  <SelectItem value="slide">Slide In</SelectItem>
                  <SelectItem value="zoom">Zoom In</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PropertySection>

          {/* Colors Section */}
          <PropertySection title="Colors">
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${exactMeasurements.propertiesPanel.fieldGap}px` }}>
              <div className="flex items-center justify-between">
                <Label
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                  }}
                >
                  Appeared
                </Label>
                <ColorPicker defaultColor="#FFFFFF" />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                  }}
                >
                  Active
                </Label>
                <ColorPicker defaultColor="#50EF12" />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                  }}
                >
                  Active Fill
                </Label>
                <ColorPicker defaultColor="#7E12FF" />
              </div>
            </div>
          </PropertySection>

          {/* Styles Section */}
          <PropertySection title="Styles">
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${exactMeasurements.propertiesPanel.fieldGap}px` }}>
              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Font
                </Label>
                <Select defaultValue="opensans">
                  <SelectTrigger
                    style={{
                      height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                      background: editorTheme.bg.tertiary,
                      border: `1px solid ${editorTheme.border.default}`,
                      borderRadius: '4px',
                      color: editorTheme.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Weight
                </Label>
                <Select defaultValue="regular">
                  <SelectTrigger
                    style={{
                      height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                      background: editorTheme.bg.tertiary,
                      border: `1px solid ${editorTheme.border.default}`,
                      borderRadius: '4px',
                      color: editorTheme.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: editorTheme.bg.tertiary, border: `1px solid ${editorTheme.border.default}`, zIndex: 9999 }}>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  className="block"
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: editorTheme.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Size
                </Label>
                <Input
                  type="number"
                  defaultValue={64}
                  style={{
                    height: `${exactMeasurements.propertiesPanel.fieldHeight}px`,
                    background: editorTheme.bg.tertiary,
                    border: `1px solid ${editorTheme.border.default}`,
                    borderRadius: '4px',
                    color: editorTheme.text.primary,
                    fontSize: typography.fontSize.base,
                  }}
                />
              </div>
            </div>
          </PropertySection>
        </>
      )}

      {/* Audio Track Properties */}
      {selectedAudioTrack && (
        <div
          style={{
            padding: `${exactMeasurements.propertiesPanel.padding}px`,
          }}
        >
          <Label
            className="block"
            style={{
              fontSize: typography.fontSize.sm,
              color: editorTheme.text.secondary,
              marginBottom: '12px',
            }}
          >
            Volume
          </Label>
          <Input
            type="range"
            min="0"
            max="100"
            defaultValue={100}
            style={{
              width: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
}
