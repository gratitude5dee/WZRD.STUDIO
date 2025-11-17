import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { editorTheme, layoutDimensions, typography } from '@/lib/editor/theme';
import { EditorTab } from './EditorIconBar';

interface EditorMediaPanelProps {
  activeTab: EditorTab;
  onAssetDrag?: (asset: any) => void;
}

// Sample Pexels-style images for demo
const sampleImages = [
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=300',
  'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=300',
];

export const EditorMediaPanel: React.FC<EditorMediaPanelProps> = ({
  activeTab,
  onAssetDrag,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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
      className="flex flex-col border-r overflow-hidden"
      style={{
        width: `${layoutDimensions.leftSidebar.mediaPanel}px`,
        background: editorTheme.bg.secondary,
        borderColor: editorTheme.border.subtle,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: editorTheme.border.subtle }}>
        <h2
          className="mb-3"
          style={{
            color: editorTheme.text.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {getTabTitle(activeTab)}
        </h2>

        {/* Search Input */}
        {activeTab === 'photos' && (
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pexels images..."
              className="pr-10"
              style={{
                height: '40px',
                background: editorTheme.bg.tertiary,
                border: `1px solid ${editorTheme.border.subtle}`,
                borderRadius: '6px',
                color: editorTheme.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: editorTheme.text.tertiary }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 gap-2">
            {sampleImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden cursor-grab transition-transform hover:scale-105"
                style={{
                  background: editorTheme.bg.tertiary,
                }}
                draggable
                onDragStart={() => onAssetDrag?.({ src, type: 'image' })}
              >
                <img
                  src={src}
                  alt={`Pexels ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        
        {activeTab !== 'photos' && (
          <div
            className="flex items-center justify-center h-32 text-center"
            style={{ color: editorTheme.text.tertiary, fontSize: typography.fontSize.sm }}
          >
            {getTabTitle(activeTab)} content will appear here
          </div>
        )}
      </div>
    </div>
  );
};
