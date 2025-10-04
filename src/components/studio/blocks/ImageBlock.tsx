
import React, { useState } from 'react';
import { Sparkles, Edit, Upload, X } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { geminiImageModel } from '@/types/modelTypes';
import { uploadFile } from '@/utils/uploadFile';
import { toast } from 'sonner';

export interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
  supportsConnections?: boolean;
  connectionPoints?: ConnectionPoint[];
  onStartConnection?: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onFinishConnection?: (blockId: string, pointId: string) => void;
  onShowHistory?: () => void;
  onDragEnd?: (position: { x: number, y: number }) => void;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  getInput?: (blockId: string, inputId: string) => any;
  setOutput?: (blockId: string, outputId: string, value: any) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ 
  id, 
  onSelect, 
  isSelected,
  supportsConnections,
  connectionPoints,
  onStartConnection,
  onFinishConnection,
  onShowHistory,
  onDragEnd,
  onRegisterRef,
  getInput,
  setOutput
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { isGenerating, imageUrl, generateImage, editImage } = useGeminiImage();

  // Check for connected input and use it as prompt if available
  React.useEffect(() => {
    if (getInput) {
      const connectedInput = getInput(id, 'prompt-input');
      if (connectedInput && typeof connectedInput === 'string') {
        setPrompt(connectedInput);
      }
    }
  }, [getInput, id]);

  // Update output whenever image is generated
  React.useEffect(() => {
    if (imageUrl && setOutput) {
      setOutput(id, 'image-output', imageUrl);
    }
  }, [imageUrl, setOutput, id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.url);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // If we have uploaded images, use them with the prompt
    if (uploadedImages.length > 0) {
      editImage(uploadedImages[0], prompt);
    } else if (editMode && imageUrl) {
      editImage(imageUrl, prompt);
    } else {
      generateImage(prompt);
    }
  };

  return (
    <BlockBase
      id={id}
      type="image"
      title="IMAGE"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~8s"
      supportsConnections={supportsConnections}
      connectionPoints={connectionPoints}
      onShowHistory={onShowHistory}
      onStartConnection={onStartConnection}
      onFinishConnection={onFinishConnection}
      onDragEnd={onDragEnd}
      onRegisterRef={onRegisterRef}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-zinc-400">{geminiImageModel.name}</span>
          </div>
          <span className="text-green-400 text-xs">FREE</span>
        </div>

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => setEditMode(true)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            {editMode && (
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-purple-500 pointer-events-auto"
                placeholder="Describe how to edit the image..."
              />
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col gap-3 min-h-[150px] bg-zinc-800/20">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-purple-500 pointer-events-auto"
              placeholder="Describe the image you want to create..."
              disabled={isGenerating}
            />
            
            {/* Upload Button */}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id={`image-upload-${id}`}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`image-upload-${id}`)?.click()}
                disabled={isUploading}
                className="w-full px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-500/30 border-t-zinc-300 rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </>
                )}
              </button>
            </label>

            {/* Display Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img 
                      src={url} 
                      alt={`Uploaded ${index + 1}`} 
                      className="w-full h-20 object-cover"
                    />
                    <button
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : uploadedImages.length > 0 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Generate from Upload
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {editMode ? 'Edit Image' : 'Generate Image'}
            </>
          )}
        </button>
      </div>
    </BlockBase>
  );
};

export default ImageBlock;
