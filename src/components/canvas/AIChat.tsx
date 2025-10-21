import { useState } from 'react';
import { Image, Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STYLE_PRESETS = [
  'Simpsons Style',
  'Anime Style',
  'Oil Painting',
  'Watercolor',
  'Pixel Art',
  'Cyberpunk',
  'Studio Ghibli',
  'Realistic',
];

export const AIChat = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Simpsons Style');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    console.log('Generating with:', { prompt, style: selectedStyle });
    // TODO: Implement actual image generation
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[600px]">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-2xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b border-border/30 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Image className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">Image to Image</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:bg-white/5"
          >
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </Button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Style</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-full bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PRESETS.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Describe your transformation..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 bg-background/50 border-border/50 focus:border-purple-500/50 transition-colors"
              />
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                size="icon"
              >
                <Play className="w-4 h-4 text-white fill-white" />
              </Button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground">
              Select an image on the canvas and describe how you want to transform it
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
