
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Upload, X, CircleDashed, Coins } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface ImagesToVideoNodeProps {
  data: {
    label?: string;
  };
}

const ImagesToVideoNode = memo(({ data }: ImagesToVideoNodeProps) => {
  const [images, setImages] = useState<string[]>(Array(9).fill(null));
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { useCredits: useCreditsFn, availableCredits } = useCredits();
  const { user } = useAuth();

  const handleImageUpload = (index: number) => {
    // This is a placeholder for the actual upload functionality
    console.log('Upload image at index:', index);
  };

  const handleGenerate = async () => {
    const uploadedImagesCount = images.filter(img => img !== null).length;
    if (uploadedImagesCount < 2) {
      toast.error('Please upload at least 2 images');
      return;
    }

    if (!user) {
      toast.error('Please log in to generate videos');
      return;
    }
    
    // Check if user has enough credits
    if (availableCredits === 0) {
      toast.error('You need credits to generate videos. Visit the credits page to get more.');
      return;
    }
    
    // Cost for video generation is higher than images (2 credits)
    const creditUsed = await useCreditsFn('video', 2, { 
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      imageCount: uploadedImagesCount
    });
    
    if (!creditUsed) {
      return;
    }
    
    setIsGenerating(true);
    // TODO: Implement actual video generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="w-[800px] bg-black/90 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50">
        <h3 className="text-white font-medium">Images to Video</h3>
        <button className="text-zinc-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex p-4 gap-4">
        {/* Left Side - Image Grid */}
        <div className="w-[300px]">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageUpload(index)}
                className="aspect-square bg-zinc-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                {image ? (
                  <img
                    src={image}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  index === 0 ? (
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <Upload className="w-4 h-4 text-zinc-400" />
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="mt-auto">
            <div className="text-xs text-zinc-400 mb-2">Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-[120px] bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none"
              placeholder="Enter your prompt..."
            />
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="flex-1">
          <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <CircleDashed className="w-8 h-8 animate-spin text-zinc-400" />
                <span className="text-sm text-zinc-400">Generating video...</span>
              </div>
            ) : (
              <div className="text-zinc-600">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-zinc-500" />
                    </div>
                  </div>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <path
                      d="M100 0 L200 100 L100 200 L0 100 Z"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                      className="text-zinc-800"
                    />
                    <path
                      d="M50 50 L150 50 L150 150 L50 150 Z"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                      className="text-zinc-800"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-zinc-800 rounded-lg">
            <Upload className="w-4 h-4 text-zinc-400" />
          </button>
          <div className="flex items-center gap-1 text-zinc-400 text-xs">
            <Coins className="h-3.5 w-3.5 text-yellow-500" />
            <span>2 credits</span>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={images.filter(img => img !== null).length < 2 || !user || availableCredits < 2}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <CircleDashed className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>Connect or upload at least 2 images</>
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

ImagesToVideoNode.displayName = 'ImagesToVideoNode';

export default ImagesToVideoNode;
