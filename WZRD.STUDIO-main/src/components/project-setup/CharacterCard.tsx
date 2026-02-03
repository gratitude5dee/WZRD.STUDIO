import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CharacterEditDialog } from './CharacterEditDialog';
import { Character } from './types';

interface CharacterCardProps {
  character: Character;
  onDelete: (characterId: string) => void;
  styleReferenceUrl?: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onDelete,
  styleReferenceUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const isImageLoading = character.image_status === 'generating';
  const hasImage = !!character.image_url;

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isGenerating) return;

    setIsGenerating(true);
    toast.info('Generating character image...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: {
          character_id: character.id,
          style_reference_url: styleReferenceUrl,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Character image generated!');
      }
    } catch (err: any) {
      console.error('Generate error:', err);
      toast.error(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!hasImage) {
      toast.info('Generate an image first before editing');
      return;
    }

    setShowEditDialog(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Delete ${character.name}?`)) return;

    setIsDeleting(true);
    try {
      onDelete(character.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className="relative bg-[#18191E] border border-zinc-700 w-56 aspect-[3/4] flex flex-col overflow-hidden transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-1 bg-[#111319] flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {character.image_url ? (
              <motion.img
                key="image"
                src={character.image_url}
                alt={character.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
              />
            ) : isImageLoading || isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center p-4"
              >
                <div className="relative">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-400 mt-3">Generating...</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-zinc-600"
              >
                <User className="h-16 w-16" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isHovered && !isImageLoading && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 flex flex-col items-center justify-end p-4"
              >
                <div className="w-full space-y-2">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className={cn(
                        'w-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm',
                        !hasImage && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={handleEdit}
                      disabled={!hasImage}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Image
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-0 backdrop-blur-sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ImagePlus className="w-4 h-4 mr-2" />
                      )}
                      {hasImage ? 'Regenerate' : 'Generate'}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0 backdrop-blur-sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="p-3 bg-[#18191E]">
          <h3 className="font-medium text-white truncate">{character.name}</h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
            {character.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      <CharacterEditDialog
        character={character}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        styleReferenceUrl={styleReferenceUrl}
      />
    </>
  );
};

export default CharacterCard;
