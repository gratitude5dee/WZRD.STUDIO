import { Sparkles, Image, Type, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCanvasStateProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
}

const EmptyCanvasState = ({ onAddBlock }: EmptyCanvasStateProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-500">
      <div className="text-center pointer-events-auto space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <Sparkles className="h-5 w-5 text-zinc-400" />
          <h2 className="text-lg text-zinc-300 font-normal">
            Double-click anywhere to create a new Block
          </h2>
        </div>
        
        <p className="text-zinc-500 text-sm">or start with...</p>
        
        <div className="flex gap-2.5 justify-center">
          <Button
            onClick={() => onAddBlock('text')}
            variant="outline"
            size="sm"
            className="bg-zinc-900/80 border-zinc-800/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Type className="h-3.5 w-3.5 mr-1.5" />
            Generate Text
          </Button>
          
          <Button
            onClick={() => onAddBlock('image')}
            variant="outline"
            size="sm"
            className="bg-zinc-900/80 border-zinc-800/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Image className="h-3.5 w-3.5 mr-1.5" />
            Create Image
          </Button>
          
          <Button
            onClick={() => onAddBlock('video')}
            variant="outline"
            size="sm"
            className="bg-zinc-900/80 border-zinc-800/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Generate Video
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvasState;
