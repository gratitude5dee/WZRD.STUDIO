import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Scale, Search, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Model {
  id: string;
  name: string;
  icon?: React.ReactNode;
  credits?: number;
  time?: string;
  description?: string;
  provider?: string;
  category?: string;
  capabilities?: Array<'text' | 'image' | 'video' | 'audio' | '3d'>;
  type?: 'text' | 'image' | 'video';
}

interface ModelSelectorProps {
  models: Model[];
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  modelType: 'text' | 'image' | 'video';
  isOpen: boolean;
  toggleOpen: () => void;
}

type ModelFilter = 'all' | 'text' | 'image' | 'video';
type QualityPreset = 'fast' | 'balanced' | 'quality';

const FILTER_LABELS: Record<ModelFilter, string> = {
  all: 'All',
  text: 'Text',
  image: 'Image',
  video: 'Video',
};

const QUALITY_OPTIONS: { value: QualityPreset; label: string; helper: string }[] = [
  { value: 'fast', label: 'Fast', helper: 'Lower cost' },
  { value: 'balanced', label: 'Balanced', helper: 'Recommended' },
  { value: 'quality', label: 'Quality', helper: 'Best results' },
];

const inferModelType = (model: Model, fallback: ModelSelectorProps['modelType']) => {
  if (model.type) return model.type;
  if (model.category?.includes('image')) return 'image';
  if (model.category?.includes('video')) return 'video';
  if (model.category?.includes('text') || model.category?.includes('llm')) return 'text';
  return fallback;
};

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onModelSelect,
  modelType,
  isOpen,
  toggleOpen,
}) => {
  const selectedModel = models.find(model => model.id === selectedModelId);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ModelFilter>('all');
  const [autoMode, setAutoMode] = useState(false);
  const [quality, setQuality] = useState<QualityPreset>('balanced');

  useEffect(() => {
    setFilter('all');
  }, [modelType]);

  const filteredModels = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return models.filter(model => {
      const inferredType = inferModelType(model, modelType);
      const matchesFilter = filter === 'all' || inferredType === filter;
      const matchesSearch =
        !searchValue ||
        model.name.toLowerCase().includes(searchValue) ||
        model.description?.toLowerCase().includes(searchValue) ||
        model.provider?.toLowerCase().includes(searchValue);
      return matchesFilter && matchesSearch;
    });
  }, [models, search, filter, modelType]);

  const recommendedModels = useMemo(() => filteredModels.slice(0, 3), [filteredModels]);
  const recommendedIds = useMemo(
    () => new Set(recommendedModels.map(model => model.id)),
    [recommendedModels]
  );
  const groupedModels = useMemo(() => {
    return filteredModels.reduce(
      (acc, model) => {
        const inferredType = inferModelType(model, modelType);
        if (!recommendedIds.has(model.id)) {
          acc[inferredType].push(model);
        }
        return acc;
      },
      { text: [] as Model[], image: [] as Model[], video: [] as Model[] }
    );
  }, [filteredModels, modelType, recommendedIds]);

  return (
    <div className="relative">
      <button
        className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-all duration-150 hover:bg-zinc-700"
        onClick={toggleOpen}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-white">
            {selectedModel?.icon ?? selectedModel?.name?.[0] ?? '?'}
          </span>
          <span className="truncate">{selectedModel?.name || 'Select Model'}</span>
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-zinc-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[360px] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/98 p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="space-y-3">
            <div className="rounded-xl border border-white/5 bg-zinc-900/70 px-3 py-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  placeholder="Search models..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {Object.entries(FILTER_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value as ModelFilter)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 transition-all',
                      filter === value
                        ? 'border-blue-500/40 bg-blue-500/20 text-blue-200'
                        : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
              <button
                type="button"
                onClick={() => setAutoMode(!autoMode)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] transition-all',
                  autoMode
                    ? 'border-blue-500/40 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'border-white/10 bg-zinc-900/80 text-zinc-400'
                )}
                title="Automatically select the best model for your task"
              >
                <span
                  className={cn(
                    'inline-flex h-3.5 w-6 items-center rounded-full border transition-all',
                    autoMode ? 'border-blue-400/60 bg-blue-500/60' : 'border-zinc-600 bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full bg-white transition-all',
                      autoMode ? 'translate-x-3' : 'translate-x-0.5'
                    )}
                  />
                </span>
                Auto mode
              </button>
              <span className="text-[10px] text-zinc-500">Auto-select best model</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-900/70 p-2">
              <div className="grid grid-cols-3 gap-2">
                {QUALITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuality(option.value)}
                    className={cn(
                      'rounded-lg border px-2 py-2 text-left text-xs transition-all',
                      quality === option.value
                        ? 'border-blue-500/40 bg-blue-500/20 text-blue-100'
                        : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {option.value === 'fast' && <Zap className="h-3 w-3" />}
                      {option.value === 'balanced' && <Scale className="h-3 w-3" />}
                      {option.value === 'quality' && <Sparkles className="h-3 w-3" />}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500">{option.helper}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {recommendedModels.length > 0 && (
              <div>
                <div className="px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Recommended
                </div>
                <div className="mt-2 space-y-1">
                  {recommendedModels.map(model => (
                    <ModelItem
                      key={model.id}
                      model={model}
                      isSelected={selectedModelId === model.id}
                      onSelect={() => {
                        onModelSelect(model.id);
                        toggleOpen();
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {(['text', 'image', 'video'] as const).map(group => {
              const groupModels = groupedModels[group];
              if (!groupModels.length) return null;
              const label = group === 'text' ? 'Text Models' : group === 'image' ? 'Image Models' : 'Video Models';
              return (
                <div key={group}>
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {label}
                  </div>
                  <div className="mt-2 space-y-1">
                    {groupModels.map(model => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={selectedModelId === model.id}
                        onSelect={() => {
                          onModelSelect(model.id);
                          toggleOpen();
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredModels.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
                No models match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ModelItemProps {
  model: Model;
  isSelected: boolean;
  onSelect: () => void;
}

const ModelItem = ({ model, isSelected, onSelect }: ModelItemProps) => {
  const capabilities = model.capabilities ?? (model.type ? [model.type] : []);
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border border-transparent border-b border-white/5 px-4 py-3 text-left transition-all last:border-b-0',
        'min-h-[64px]',
        isSelected ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/40'
      )}
      onClick={onSelect}
    >
      {isSelected && <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-full bg-blue-500" />}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm text-white">
        {model.icon ?? model.name[0]}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">{model.name}</span>
          {model.provider && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
              {model.provider}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
          {model.credits && <span>{model.credits} tokens</span>}
          {model.time && <span>~{model.time}</span>}
          {model.description && <span className="truncate">{model.description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {capabilities.map(capability => (
          <span
            key={capability}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                capability === 'text'
                  ? '#3B82F6'
                  : capability === 'image'
                  ? '#10B981'
                  : capability === 'video'
                  ? '#8B5CF6'
                  : capability === 'audio'
                  ? '#EC4899'
                  : '#6B7280',
              boxShadow: `0 0 6px ${
                capability === 'text'
                  ? 'rgba(59,130,246,0.4)'
                  : capability === 'image'
                  ? 'rgba(16,185,129,0.4)'
                  : capability === 'video'
                  ? 'rgba(139,92,246,0.4)'
                  : capability === 'audio'
                  ? 'rgba(236,72,153,0.4)'
                  : 'rgba(107,114,128,0.3)'
              }`,
            }}
          />
        ))}
      </div>
      {isSelected && <Check className="h-4 w-4 text-zinc-100" />}
    </button>
  );
};

export default ModelSelector;
