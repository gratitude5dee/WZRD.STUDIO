import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';

interface PropertySectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PropertySection({ title, children, defaultOpen = true }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: `1px solid ${editorTheme.border.subtle}`,
      }}
    >
      <button
        className="flex items-center justify-between w-full transition-colors"
        style={{
          padding: `12px ${exactMeasurements.propertiesPanel.padding}px`,
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.currentTarget.style.background = editorTheme.bg.hover}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            color: editorTheme.text.primary,
          }}
        >
          {title}
        </span>
        <ChevronDown
          className="transition-transform duration-200"
          style={{
            width: '16px',
            height: '16px',
            color: editorTheme.text.tertiary,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        />
      </button>
      
      {isOpen && (
        <div
          style={{
            padding: `0 ${exactMeasurements.propertiesPanel.padding}px ${exactMeasurements.propertiesPanel.padding}px`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
