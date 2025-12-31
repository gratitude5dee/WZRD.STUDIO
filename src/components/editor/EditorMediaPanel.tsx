import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { editorTheme, layoutDimensions, typography, exactMeasurements } from '@/lib/editor/theme';
import { EditorTab } from './EditorIconBar';
import { AssetDropZone } from './AssetDropZone';
import { VideoLibraryTab } from './tabs/VideoLibraryTab';
import { MusicLibraryTab } from './tabs/MusicLibraryTab';
import { TextOverlayTab } from './tabs/TextOverlayTab';
import { TransitionsTab } from './tabs/TransitionsTab';
import { EffectsTab } from './tabs/EffectsTab';
import { ElementsTab } from './tabs/ElementsTab';
import { toast } from 'sonner';

interface EditorMediaPanelProps {
  activeTab: EditorTab;
  onAssetDrag?: (asset: any) => void;
  onAddToTimeline?: (item: any) => void;
  onApplyTransition?: (transition: any) => void;
  onApplyEffect?: (effect: any) => void;
  projectId?: string;
}

// Sample Pexels-style images for demo
const sampleImages = [
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=300',
];

export const EditorMediaPanel: React.FC<EditorMediaPanelProps> = ({
  activeTab,
  onAssetDrag,
  onAddToTimeline,
  onApplyTransition,
  onApplyEffect,
  projectId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handler for adding items to timeline
  const handleAddToTimeline = useCallback((item: any) => {
    if (onAddToTimeline) {
      onAddToTimeline(item);
    } else {
      toast.success(`Added ${item.name || item.type} to timeline`);
    }
  }, [onAddToTimeline]);

  // Handler for applying transitions
  const handleApplyTransition = useCallback((transition: any) => {
    if (onApplyTransition) {
      onApplyTransition(transition);
    } else {
      toast.success(`Applied ${transition.name} transition`);
    }
  }, [onApplyTransition]);

  // Handler for applying effects
  const handleApplyEffect = useCallback((effect: any) => {
    if (onApplyEffect) {
      onApplyEffect(effect);
    } else {
      toast.success(`Applied ${effect.name} effect`);
    }
  }, [onApplyEffect]);

  const getTabTitle = (tab: EditorTab): string => {
    const titles: Record<EditorTab, string> = {
      upload: 'Upload',
      photos: 'Photos',
      videos: 'Videos',
      elements: 'Elements',
      text: 'Text',
      music: 'Music',
      transitions: 'Transitions',
      effects: 'Effects',
    };
    return titles[tab];
  };

  return (
    <div
      className="flex flex-col border-r overflow-hidden backdrop-blur-xl relative z-10"
      style={{
        width: `${exactMeasurements.mediaPanel.width}px`,
        background: 'rgba(15, 15, 20, 0.8)',
        borderColor: editorTheme.border.subtle,
      }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          padding: `${exactMeasurements.mediaPanel.padding}px`,
          borderColor: editorTheme.border.subtle,
        }}
      >
        <h2
          style={{
            color: editorTheme.text.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: '12px',
          }}
        >
          {getTabTitle(activeTab)}
        </h2>

        {/* Search Input - Photos tab only */}
        {activeTab === 'photos' && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pexels images..."
              className="w-full pr-10 focus:outline-none focus:ring-2 transition-all"
              style={{
                height: `${exactMeasurements.mediaPanel.searchHeight}px`,
                background: editorTheme.bg.tertiary,
                border: `1px solid ${editorTheme.border.subtle}`,
                borderRadius: `${exactMeasurements.mediaPanel.imageBorderRadius}px`,
                color: editorTheme.text.primary,
                fontSize: typography.fontSize.sm,
                padding: '0 12px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = editorTheme.border.focus;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${editorTheme.border.focus}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = editorTheme.border.subtle;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{ color: editorTheme.text.tertiary }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: `${exactMeasurements.mediaPanel.padding}px`,
        }}
      >
        {activeTab === 'photos' && (
          <div
            className="grid grid-cols-2"
            style={{
              gap: `${exactMeasurements.mediaPanel.gridGap}px`,
            }}
          >
            {sampleImages.map((src, index) => (
              <div
                key={index}
                className="relative cursor-grab active:cursor-grabbing transition-transform duration-200"
                style={{
                  aspectRatio: exactMeasurements.mediaPanel.imageAspectRatio,
                  borderRadius: `${exactMeasurements.mediaPanel.imageBorderRadius}px`,
                  overflow: 'hidden',
                  background: editorTheme.bg.tertiary,
                }}
                draggable
                onDragStart={() => onAssetDrag?.({ src, type: 'image' })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={src}
                  alt={`Pexels ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'upload' && <AssetDropZone />}

        {activeTab === 'videos' && (
          <VideoLibraryTab
            projectId={projectId}
            onSelectVideo={(video) => {
              handleAddToTimeline({
                type: 'video',
                url: video.url,
                duration: video.duration,
                name: video.name,
              });
            }}
          />
        )}

        {activeTab === 'elements' && (
          <ElementsTab
            onSelectElement={(element) => {
              handleAddToTimeline({
                type: 'element',
                elementType: element.type,
                ...element,
              });
            }}
          />
        )}

        {activeTab === 'text' && (
          <TextOverlayTab
            onAddText={(textConfig) => {
              handleAddToTimeline({
                type: 'text',
                text: textConfig.text,
                style: textConfig.style,
                position: textConfig.position,
                duration: 5000,
              });
            }}
          />
        )}

        {activeTab === 'music' && (
          <MusicLibraryTab
            onSelectTrack={(track) => {
              handleAddToTimeline({
                type: 'audio',
                url: track.url,
                duration: track.duration,
                name: track.name,
              });
            }}
          />
        )}

        {activeTab === 'transitions' && (
          <TransitionsTab
            onSelectTransition={(transition) => {
              handleApplyTransition(transition);
            }}
          />
        )}

        {activeTab === 'effects' && (
          <EffectsTab
            onSelectEffect={(effect) => {
              handleApplyEffect(effect);
            }}
          />
        )}
      </div>
    </div>
  );
};
