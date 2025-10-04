import { Plus } from 'lucide-react';

interface NewProjectCardProps {
  onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-[4/3] bg-[#1A1A1A] border-2 border-dashed border-white/[0.12] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-white/[0.24] hover:bg-white/[0.02] transition-all duration-200 group"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        <Plus className="w-7 h-7 text-white" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-white mb-1">New Project</p>
        <p className="text-sm text-white/40">Start creating</p>
      </div>
    </button>
  );
};
