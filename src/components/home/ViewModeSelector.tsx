
type ViewMode = 'studio' | 'timeline' | 'editor';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewModeSelector = ({ viewMode, setViewMode }: ViewModeSelectorProps) => {
  return (
    <div className="flex bg-[#16192A] rounded-lg border border-[#272C3F] p-0.5 mx-auto shadow-inner">
      <button
        onClick={() => setViewMode('studio')}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          viewMode === 'studio'
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Studio
      </button>
      <button
        onClick={() => setViewMode('timeline')}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          viewMode === 'timeline'
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Timeline
      </button>
      <button
        onClick={() => setViewMode('editor')}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          viewMode === 'editor'
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Editor
      </button>
    </div>
  );
};
