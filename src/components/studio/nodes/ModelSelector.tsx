import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFalModels } from '@/hooks/useFalModels';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  categoryFilters?: string[];
  label?: string;
  className?: string;
}

const normalize = (value: string) => value.trim().toLowerCase();

const matchesCategory = (category: string | undefined, filters: string[]) => {
  if (!filters.length) return true;
  const normalizedCategory = normalize(category || '');
  return filters.some(filter => normalizedCategory.includes(normalize(filter)));
};

const ModelSelector = ({
  selectedModelId,
  onModelSelect,
  categoryFilters = [],
  label = 'Model',
  className,
}: ModelSelectorProps) => {
  const { models, isLoading, error } = useFalModels({ autoFetch: true });
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const filteredModels = useMemo(() => {
    const searchValue = normalize(search);
    return models.filter(model => {
      if (!matchesCategory(model.category, categoryFilters)) return false;
      if (!searchValue) return true;
      return (
        normalize(model.name).includes(searchValue) ||
        normalize(model.description).includes(searchValue) ||
        normalize(model.id).includes(searchValue)
      );
    });
  }, [models, categoryFilters, search]);

  const groupedModels = useMemo(() => {
    return filteredModels.reduce((acc, model) => {
      const key = model.category || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(model);
      return acc;
    }, {} as Record<string, typeof filteredModels>);
  }, [filteredModels]);

  const selectedModel = useMemo(
    () => models.find(model => model.id === selectedModelId),
    [models, selectedModelId]
  );

  const categoryKeys = useMemo(
    () => Object.keys(groupedModels).sort(),
    [groupedModels]
  );

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-zinc-700',
          'bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-zinc-600'
        )}
      >
        <span className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
          <span className="text-xs text-zinc-200">
            {selectedModel?.name || selectedModelId || 'Select a model'}
          </span>
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-zinc-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-lg border border-zinc-800 bg-zinc-950/95 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="mb-2 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1">
            <Search className="h-3.5 w-3.5 text-zinc-500" />
            <input
              className="w-full bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
              placeholder="Search models"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading models...
            </div>
          )}

          {error && !isLoading && (
            <div className="px-2 py-3 text-xs text-red-400">{error}</div>
          )}

          {!isLoading && !error && categoryKeys.length === 0 && (
            <div className="px-2 py-3 text-xs text-zinc-500">No models available.</div>
          )}

          {!isLoading && !error && categoryKeys.length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              {categoryKeys.map(category => {
                const isCollapsed = collapsedCategories[category];
                return (
                  <div key={category} className="mb-2 last:mb-0">
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsedCategories(prev => ({
                          ...prev,
                          [category]: !prev[category],
                        }))
                      }
                      className="flex w-full items-center justify-between rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
                    >
                      <span>{category}</span>
                      <ChevronRight className={cn('h-3 w-3 transition-transform', !isCollapsed && 'rotate-90')} />
                    </button>

                    {!isCollapsed && (
                      <div className="mt-1 space-y-1">
                        {groupedModels[category]?.map(model => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              onModelSelect(model.id);
                              setIsOpen(false);
                            }}
                            className={cn(
                              'w-full rounded-md border border-transparent px-2 py-2 text-left text-xs',
                              'transition-colors hover:border-zinc-700 hover:bg-zinc-900',
                              selectedModelId === model.id && 'border-blue-500/40 bg-blue-500/10'
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-zinc-100">{model.name}</span>
                              {selectedModelId === model.id && (
                                <span className="text-[10px] text-blue-300">Selected</span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[10px] text-zinc-500">
                              {model.description || model.id}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
