import { Sparkles, Image, Type, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCanvasStateProps {
  onAddBlock: (type: 'text' | 'image' | 'video') => void;
}

const EmptyCanvasState = ({ onAddBlock }: EmptyCanvasStateProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center pointer-events-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-canvas-accent-blue" />
          <h2 className="text-xl text-canvas-text-primary font-medium">
            Double-click anywhere to create a new Block
          </h2>
        </div>
        
        <p className="text-canvas-text-secondary mb-4">or start with...</p>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => onAddBlock('text')}
            variant="outline"
            className="bg-canvas-block border-canvas-connector-default hover:bg-canvas-accent-blue/20 hover:border-canvas-accent-blue text-canvas-text-primary"
          >
            <Type className="h-4 w-4 mr-2" />
            Generate Text
          </Button>
          
          <Button
            onClick={() => onAddBlock('image')}
            variant="outline"
            className="bg-canvas-block border-canvas-connector-default hover:bg-canvas-accent-blue/20 hover:border-canvas-accent-blue text-canvas-text-primary"
          >
            <Image className="h-4 w-4 mr-2" />
            Create Image
          </Button>
          
          <Button
            onClick={() => onAddBlock('video')}
            variant="outline"
            className="bg-canvas-block border-canvas-connector-default hover:bg-canvas-accent-blue/20 hover:border-canvas-accent-blue text-canvas-text-primary"
          >
            <Video className="h-4 w-4 mr-2" />
            Generate Video
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvasState;
