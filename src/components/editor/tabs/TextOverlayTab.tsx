import React, { useState, useCallback } from 'react';
import { Type, Plus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TextConfig {
  text: string;
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    backgroundColor?: string;
    textAlign: 'left' | 'center' | 'right';
  };
  position: { x: number; y: number };
}

interface TextOverlayTabProps {
  onAddText: (config: TextConfig) => void;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Lato', label: 'Lato' },
];

const presets = [
  { name: 'Title', fontSize: 48, fontWeight: 'bold', fontFamily: 'Inter' },
  { name: 'Subtitle', fontSize: 32, fontWeight: '500', fontFamily: 'Inter' },
  { name: 'Body', fontSize: 18, fontWeight: 'normal', fontFamily: 'Inter' },
  { name: 'Caption', fontSize: 14, fontWeight: 'normal', fontFamily: 'Inter' },
];

export const TextOverlayTab: React.FC<TextOverlayTabProps> = ({ onAddText }) => {
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState('normal');
  const [color, setColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  const handleAddText = useCallback(() => {
    if (!text.trim()) {
      return;
    }

    onAddText({
      text,
      style: {
        fontFamily,
        fontSize,
        fontWeight,
        color,
        backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
        textAlign,
      },
      position: { x: 50, y: 50 },
    });

    setText('');
  }, [text, fontFamily, fontSize, fontWeight, color, bgColor, textAlign, onAddText]);

  const applyPreset = useCallback((preset: (typeof presets)[0]) => {
    setFontSize(preset.fontSize);
    setFontWeight(preset.fontWeight);
    setFontFamily(preset.fontFamily);
  }, []);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
      {/* Quick Presets */}
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Text Content</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Font Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Font</label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Size</label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min={8}
            max={200}
            className="text-xs"
          />
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Weight</label>
        <Select value={fontWeight} onValueChange={setFontWeight}>
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="500">Medium</SelectItem>
            <SelectItem value="600">Semi Bold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="800">Extra Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Alignment</label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <Button
              key={value}
              variant={textAlign === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTextAlign(value as 'left' | 'center' | 'right')}
              className="flex-1"
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Text Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={bgColor === 'transparent' ? '#000000' : bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-zinc-700"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBgColor('transparent')}
              className={cn('text-xs', bgColor === 'transparent' && 'bg-zinc-700')}
            >
              None
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs text-zinc-400 mb-2 block">Preview</label>
        <div
          className="p-4 rounded-lg border border-zinc-700 min-h-[60px] flex items-center justify-center"
          style={{
            backgroundColor: bgColor !== 'transparent' ? bgColor : 'rgba(0,0,0,0.5)',
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: `${Math.min(fontSize, 24)}px`,
              fontWeight,
              color,
              textAlign,
            }}
          >
            {text || 'Preview text'}
          </span>
        </div>
      </div>

      {/* Add Button */}
      <Button onClick={handleAddText} disabled={!text.trim()} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Text Overlay
      </Button>
    </div>
  );
};

TextOverlayTab.displayName = 'TextOverlayTab';
