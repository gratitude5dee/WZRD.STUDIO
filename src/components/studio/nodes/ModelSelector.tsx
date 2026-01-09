import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Loader2, Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFalModels } from '@/hooks/useFalModels';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  categoryFilters?: string[];
  label?: string;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  compact?: boolean;
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
  collapsible = true,
  defaultCollapsed = true,
  compact = false,
}: ModelSelectorProps) => {
  const { models, isLoading, error } = useFalModels({ autoFetch: true });
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
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

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.model-selector-container')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Compact view for collapsed state
  if (collapsible && isCollapsed) {
    return (
      <motion.div
        className={cn('model-selector-container relative', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg',
            'border border-border-subtle/60 bg-surface-2/80 backdrop-blur-sm',
            'px-3 py-2 text-xs transition-all duration-200',
            'hover:border-accent-purple/40 hover:bg-surface-3/80',
            'group'
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
            <span className="text-text-secondary group-hover:text-text-primary">
              {selectedModel?.name || 'Select Model'}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('model-selector-container relative', className)}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header with collapse option */}
      {collapsible && (
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              {label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded hover:bg-surface-3 transition-colors"
            aria-label="Collapse model selector"
          >
            <ChevronUp className="h-3.5 w-3.5 text-text-tertiary hover:text-text-secondary" />
          </button>
        </div>
      )}

      {/* Main selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg',
          'border border-border-subtle/60 bg-surface-2/80 backdrop-blur-sm',
          'px-3 py-2.5 text-xs transition-all duration-200',
          'hover:border-accent-purple/40 hover:bg-surface-3/80',
          isOpen && 'border-accent-purple/50 bg-surface-3/80'
        )}
      >
        <div className="flex flex-col items-start gap-0.5">
          {!collapsible && (
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</span>
          )}
          <span className="text-xs text-text-primary font-medium">
            {selectedModel?.name || selectedModelId || 'Select a model'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-text-tertiary transition-transform duration-200',
            isOpen && 'rotate-180 text-accent-purple'
          )}
        />
      </button>

      {/* Dropdown content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-0 right-0 z-50 mt-2 rounded-xl',
              'border border-border-subtle/80 bg-surface-1/98 backdrop-blur-xl',
              'p-2 shadow-2xl shadow-black/40'
            )}
          >
            {/* Search input */}
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-border-subtle/60 bg-surface-2/80 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-text-tertiary" />
              <input
                className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-disabled"
                placeholder="Search models..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-0.5 hover:text-text-primary text-text-tertiary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-4 text-xs text-text-tertiary">
                <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
                <span>Loading models...</span>
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="px-2 py-3 text-xs text-rose-400">{error}</div>
            )}

            {/* Empty state */}
            {!isLoading && !error && categoryKeys.length === 0 && (
              <div className="px-2 py-4 text-xs text-text-tertiary text-center">
                No models available
              </div>
            )}

            {/* Model list */}
            {!isLoading && !error && categoryKeys.length > 0 && (
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {categoryKeys.map(category => {
                  const isCategoryCollapsed = collapsedCategories[category];
                  return (
                    <div key={category} className="mb-1 last:mb-0">
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedCategories(prev => ({
                            ...prev,
                            [category]: !prev[category],
                          }))
                        }
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-2 py-1.5',
                          'text-[10px] font-semibold uppercase tracking-wider',
                          'text-text-tertiary hover:text-text-secondary hover:bg-surface-2/50',
                          'transition-colors duration-150'
                        )}
                      >
                        <span>{category}</span>
                        <ChevronRight
                          className={cn(
                            'h-3 w-3 transition-transform duration-200',
                            !isCategoryCollapsed && 'rotate-90'
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {!isCategoryCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 space-y-0.5 overflow-hidden"
                          >
                            {groupedModels[category]?.map(model => (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  onModelSelect(model.id);
                                  setIsOpen(false);
                                }}
                                className={cn(
                                  'w-full rounded-lg border border-transparent px-2.5 py-2 text-left text-xs',
                                  'transition-all duration-150',
                                  'hover:border-accent-purple/30 hover:bg-accent-purple/5',
                                  selectedModelId === model.id && 'border-accent-purple/50 bg-accent-purple/10'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-text-primary font-medium">{model.name}</span>
                                  {selectedModelId === model.id && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple font-medium">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-[10px] text-text-tertiary leading-relaxed">
                                  {model.description || model.id}
                                </p>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModelSelector;
