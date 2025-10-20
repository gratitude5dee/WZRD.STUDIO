import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryToolbar } from './GalleryToolbar';
import { GalleryCard } from './GalleryCard';
import { X, Sparkles } from 'lucide-react';

interface ResultItem {
  id: string;
  imageUrl: string;
  title: string;
  model: string;
}

interface ResultsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  results?: ResultItem[];
}

// Mock results for demo
const MOCK_RESULTS: ResultItem[] = [
  {
    id: '1',
    imageUrl: '/lovable-uploads/075616c6-e4fc-4662-a4b8-68b746782b65.png',
    title: 'Tiger in Snow',
    model: 'Flux Dev',
  },
  {
    id: '2',
    imageUrl: '/lovable-uploads/4e20f36a-2bff-48d8-b07b-257334e35506.png',
    title: 'Snow Tiger',
    model: 'Flux Dev',
  },
  {
    id: '3',
    imageUrl: '/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png',
    title: 'Tiger Portrait',
    model: 'Flux Dev',
  },
  {
    id: '4',
    imageUrl: '/lovable-uploads/f8be561d-d5b5-49a8-adaa-dbf01721ef9f.png',
    title: 'Winter Tiger',
    model: 'Flux Dev',
  },
];

export const ResultsGallery = ({
  isOpen,
  onClose,
  results = MOCK_RESULTS,
}: ResultsGalleryProps) => {
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [model, setModel] = useState('Flux Dev');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed right-0 top-0 h-full w-[420px] bg-[#141416] border-l border-[#27272A] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6366F1]" />
              <h2 className="text-base font-semibold text-[#FAFAFA]">Results</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </div>

          {/* Toolbar */}
          <GalleryToolbar
            aspectRatio={aspectRatio}
            model={model}
            onAspectRatioChange={setAspectRatio}
            onModelChange={setModel}
          />

          {/* Gallery Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {results.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                >
                  <GalleryCard
                    id={result.id}
                    imageUrl={result.imageUrl}
                    title={result.title}
                    model={result.model}
                    selected={selectedCard === result.id}
                    onClick={() => setSelectedCard(result.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
