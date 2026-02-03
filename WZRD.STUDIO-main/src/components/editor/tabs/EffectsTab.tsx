import React, { useState, useCallback } from 'react';
import { Sliders, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Effect {
  id: string;
  name: string;
  type: 'filter' | 'adjustment' | 'overlay';
  params: Record<string, number>;
  icon?: string;
}

interface EffectsTabProps {
  onSelectEffect: (effect: Effect) => void;
}

const effects: Effect[] = [
  { id: 'brightness', name: 'Brightness', type: 'adjustment', params: { value: 100 } },
  { id: 'contrast', name: 'Contrast', type: 'adjustment', params: { value: 100 } },
  { id: 'saturation', name: 'Saturation', type: 'adjustment', params: { value: 100 } },
  { id: 'exposure', name: 'Exposure', type: 'adjustment', params: { value: 0 } },
  { id: 'blur', name: 'Blur', type: 'filter', params: { radius: 0 } },
  { id: 'sharpen', name: 'Sharpen', type: 'filter', params: { amount: 0 } },
  { id: 'grayscale', name: 'Grayscale', type: 'filter', params: { amount: 0 } },
  { id: 'sepia', name: 'Sepia', type: 'filter', params: { amount: 0 } },
  { id: 'invert', name: 'Invert', type: 'filter', params: { amount: 0 } },
  { id: 'vignette', name: 'Vignette', type: 'overlay', params: { intensity: 0 } },
  { id: 'grain', name: 'Film Grain', type: 'overlay', params: { amount: 0 } },
  { id: 'noise', name: 'Noise', type: 'overlay', params: { amount: 0 } },
];

const getParamConfig = (effectId: string, paramKey: string) => {
  const configs: Record<string, { min: number; max: number; step: number }> = {
    brightness: { min: 0, max: 200, step: 1 },
    contrast: { min: 0, max: 200, step: 1 },
    saturation: { min: 0, max: 200, step: 1 },
    exposure: { min: -100, max: 100, step: 1 },
    blur: { min: 0, max: 20, step: 0.5 },
    sharpen: { min: 0, max: 100, step: 1 },
    grayscale: { min: 0, max: 100, step: 1 },
    sepia: { min: 0, max: 100, step: 1 },
    invert: { min: 0, max: 100, step: 1 },
    vignette: { min: 0, max: 100, step: 1 },
    grain: { min: 0, max: 100, step: 1 },
    noise: { min: 0, max: 100, step: 1 },
  };
  return configs[effectId] || { min: 0, max: 100, step: 1 };
};

export const EffectsTab: React.FC<EffectsTabProps> = ({ onSelectEffect }) => {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [effectParams, setEffectParams] = useState<Record<string, number>>({});

  const handleSelectEffect = useCallback((effect: Effect) => {
    setSelectedEffect(effect.id);
    setEffectParams(effect.params);
  }, []);

  const handleApply = useCallback(() => {
    const effect = effects.find((e) => e.id === selectedEffect);
    if (effect) {
      onSelectEffect({ ...effect, params: effectParams });
      setSelectedEffect(null);
      setEffectParams({});
    }
  }, [selectedEffect, effectParams, onSelectEffect]);

  const handleReset = useCallback(() => {
    const effect = effects.find((e) => e.id === selectedEffect);
    if (effect) {
      setEffectParams(effect.params);
    }
  }, [selectedEffect]);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Effects Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {effects.map((effect) => (
          <div
            key={effect.id}
            onClick={() => handleSelectEffect(effect)}
            className={cn(
              'p-3 bg-zinc-800 rounded-lg cursor-pointer transition-all',
              'hover:bg-zinc-700',
              selectedEffect === effect.id && 'ring-2 ring-purple-500 bg-zinc-700'
            )}
          >
            <Sliders className="w-5 h-5 mb-2 text-zinc-400" />
            <p className="text-[10px] text-zinc-300 truncate">{effect.name}</p>
          </div>
        ))}
      </div>

      {/* Effect Settings */}
      {selectedEffect && (
        <div className="flex-1 border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              {effects.find((e) => e.id === selectedEffect)?.name} Settings
            </p>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
              Reset
            </Button>
          </div>

          {Object.entries(effectParams).map(([key, value]) => {
            const config = getParamConfig(selectedEffect, key);
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span className="capitalize">{key}</span>
                  <span>{typeof value === 'number' ? value.toFixed(config.step < 1 ? 1 : 0) : value}</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => setEffectParams((prev) => ({ ...prev, [key]: v }))}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  className="w-full"
                />
              </div>
            );
          })}

          <Button onClick={handleApply} className="w-full mt-4">
            <Check className="w-4 h-4 mr-2" />
            Apply Effect
          </Button>
        </div>
      )}
    </div>
  );
};

EffectsTab.displayName = 'EffectsTab';
