import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Character } from './types';

interface CharacterEditDialogProps {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleReferenceUrl?: string;
}

export const CharacterEditDialog: React.FC<CharacterEditDialogProps> = ({
  character,
  open,
  onOpenChange,
  styleReferenceUrl,
}) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      toast.error('Please describe what changes you want');
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-character-image', {
        body: {
          character_id: character.id,
          source_image_url: character.image_url,
          edit_prompt: editPrompt,
          style_reference_url: styleReferenceUrl,
        },
      });

      if (error) throw error;

      if (data?.edited_image_url) {
        setPreviewUrl(data.edited_image_url);
        toast.success('Edit applied! Review the changes.');
      }
    } catch (err: any) {
      console.error('Edit error:', err);
      toast.error(err.message || 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleApplyEdit = async () => {
    if (!previewUrl) return;

    try {
      const { error } = await supabase
        .from('characters')
        .update({ image_url: previewUrl })
        .eq('id', character.id);

      if (error) throw error;

      toast.success('Changes saved!');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Failed to save changes');
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setEditPrompt('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#111319] border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit {character.name}'s Image
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Original</Label>
            <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden">
              {character.image_url && (
                <img
                  src={character.image_url}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400">Preview</Label>
            <div className="aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
              {isEditing ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-zinc-500 mt-2">Applying edit...</p>
                </div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-sm text-zinc-600">Describe changes below</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-zinc-400">What would you like to change?</Label>
          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="e.g., 'Change the hair color to blonde', 'Add a smile', 'Put them in a red jacket'..."
            className="bg-[#18191E] border-zinc-700 min-h-[80px]"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleReset} disabled={isEditing}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleEditImage}
              disabled={isEditing || !editPrompt.trim()}
            >
              {isEditing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Apply Edit
            </Button>

            {previewUrl && <Button onClick={handleApplyEdit}>Save Changes</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
