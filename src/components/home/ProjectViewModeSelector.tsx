type ViewMode = 'grid' | 'list';

interface ProjectViewModeSelectorProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ProjectViewModeSelector = ({ viewMode, setViewMode }: ProjectViewModeSelectorProps) => {
  return (
    <div className="flex bg-white/[0.04] rounded-lg border border-white/[0.08] p-0.5">
      <button
        onClick={() => setViewMode('grid')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm'
            : 'text-white/60 hover:text-white'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm'
            : 'text-white/60 hover:text-white'
        }`}
      >
        List
      </button>
    </div>
  );
};
