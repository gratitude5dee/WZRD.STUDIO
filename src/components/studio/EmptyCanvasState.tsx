import { Image, Sparkles, Video, Workflow, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCanvasStateProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
}

const EmptyCanvasState = ({ onAddBlock }: EmptyCanvasStateProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-500">
      <div className="text-center pointer-events-auto space-y-4">
        <h2 className="text-sm text-zinc-400 font-normal">
          ⌘ Double-click anywhere to create a new Block, or start with...
        </h2>
        
        <div className="flex gap-2 justify-center flex-wrap max-w-2xl">
          <Button
            onClick={() => onAddBlock('image')}
            variant="outline"
            size="sm"
            className="bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Image className="h-3.5 w-3.5 mr-1.5" />
            Describe an Image
          </Button>
          
          <Button
            onClick={() => onAddBlock('text')}
            variant="outline"
            size="sm"
            className="bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Combine ideas
          </Button>
          
          <Button
            onClick={() => onAddBlock('video')}
            variant="outline"
            size="sm"
            className="bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
          >
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Make a video from an image
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
            disabled
          >
            <Workflow className="h-3.5 w-3.5 mr-1.5" />
            Explore Flows
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all duration-200"
            disabled
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvasState;
