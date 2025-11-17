import React from 'react';
import { Upload, Image, Film, Box, Type, Music, Shuffle, Wand2 } from 'lucide-react';
import { editorTheme, layoutDimensions } from '@/lib/editor/theme';

export type EditorTab = 'upload' | 'photos' | 'videos' | 'elements' | 'text' | 'music' | 'transitions' | 'effects';

interface EditorIconBarProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
}

interface IconBarItem {
  id: EditorTab;
  icon: React.ReactNode;
  label: string;
}

export const EditorIconBar: React.FC<EditorIconBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const items: IconBarItem[] = [
    { id: 'upload', icon: <Upload size={24} />, label: 'Upload' },
    { id: 'photos', icon: <Image size={24} />, label: 'Photos' },
    { id: 'videos', icon: <Film size={24} />, label: 'Videos' },
    { id: 'elements', icon: <Box size={24} />, label: 'Elements' },
    { id: 'text', icon: <Type size={24} />, label: 'Text' },
    { id: 'music', icon: <Music size={24} />, label: 'Music' },
    { id: 'transitions', icon: <Shuffle size={24} />, label: 'Transitions' },
    { id: 'effects', icon: <Wand2 size={24} />, label: 'Effects' },
  ];

  return (
    <div
      className="flex flex-col border-r"
      style={{
        width: `${layoutDimensions.leftSidebar.iconBar}px`,
        background: editorTheme.bg.secondary,
        borderColor: editorTheme.border.subtle,
      }}
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="relative flex items-center justify-center transition-colors"
            style={{
              height: '60px',
              color: isActive ? editorTheme.accent.primary : editorTheme.text.secondary,
              background: isActive ? editorTheme.bg.active : 'transparent',
            }}
            onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = editorTheme.bg.hover)}
            onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
            title={item.label}
          >
            {item.icon}
            {isActive && (
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: '3px',
                  background: editorTheme.accent.primary,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
