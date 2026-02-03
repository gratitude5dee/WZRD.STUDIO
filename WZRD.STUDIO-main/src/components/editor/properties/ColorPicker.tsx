import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';

interface ColorPickerProps {
  defaultColor?: string;
  onChange?: (color: string) => void;
}

export function ColorPicker({ defaultColor = '#FFFFFF', onChange }: ColorPickerProps) {
  const [color, setColor] = useState(defaultColor);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 transition-all"
          style={{
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: `${exactMeasurements.propertiesPanel.colorSwatchSize}px`,
              height: `${exactMeasurements.propertiesPanel.colorSwatchSize}px`,
              borderRadius: '4px',
              border: `${exactMeasurements.propertiesPanel.colorSwatchBorder}px solid ${editorTheme.border.default}`,
              background: color,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <span
            style={{
              fontFamily: typography.fontFamily.mono,
              fontSize: typography.fontSize.xs,
              color: editorTheme.text.secondary,
              textTransform: 'uppercase',
            }}
          >
            {color}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        style={{
          background: editorTheme.bg.tertiary,
          border: `1px solid ${editorTheme.border.default}`,
          zIndex: 9999,
        }}
      >
        <div className="space-y-3">
          <div>
            <label
              style={{
                fontSize: typography.fontSize.sm,
                color: editorTheme.text.secondary,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Color Picker
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-32 cursor-pointer rounded"
              style={{
                border: `1px solid ${editorTheme.border.default}`,
              }}
            />
          </div>
          
          <div>
            <label
              style={{
                fontSize: typography.fontSize.sm,
                color: editorTheme.text.secondary,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Hex Value
            </label>
            <Input
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: typography.fontSize.sm,
                background: editorTheme.bg.secondary,
                border: `1px solid ${editorTheme.border.default}`,
                color: editorTheme.text.primary,
              }}
            />
          </div>

          {/* Preset colors */}
          <div>
            <label
              style={{
                fontSize: typography.fontSize.sm,
                color: editorTheme.text.secondary,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Presets
            </label>
            <div className="grid grid-cols-6 gap-2">
              {['#FFFFFF', '#000000', '#50EF12', '#7E12FF', '#FF4444', '#4A9EFF', '#FFA500', '#FF69B4'].map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: `2px solid ${color === presetColor ? editorTheme.accent.primary : editorTheme.border.default}`,
                    background: presetColor,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
