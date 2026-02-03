import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, ChevronDown, Upload, Link, X, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CharacterDetails {
  id: string;
  name: string;
  image_url?: string | null;
}

interface ClothingData {
  clothingPrompt: string;
  referenceImages: Array<{ id: string; url: string; description?: string }>;
  accessories: string[];
  hairStyle: string;
  makeupDescription: string;
  notes: string;
}

interface ClothingSectionProps {
  sceneId: string;
  characters: CharacterDetails[];
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ClothingSection({
  sceneId,
  characters,
  isOpen = false,
  onToggle
}: ClothingSectionProps) {
  const [characterData, setCharacterData] = useState<Record<string, ClothingData>>({});
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(characters[0]?.id || '');

  // Load existing clothing data
  useEffect(() => {
    const loadClothingData = async () => {
      try {
        // Cast to any since character_scene_appearances table may not be in generated types
        const { data, error } = await (supabase as any)
          .from('character_scene_appearances')
          .select('*')
          .eq('scene_id', sceneId);

        if (error) throw error;

        const dataMap: Record<string, ClothingData> = {};
        (data || []).forEach((appearance: any) => {
          dataMap[appearance.character_id] = {
            clothingPrompt: appearance.clothing_prompt || '',
            referenceImages: (appearance.clothing_reference_images || []).map((url: string, idx: number) => ({
              id: `img-${idx}`,
              url
            })),
            accessories: appearance.accessories || [],
            hairStyle: appearance.hair_style || '',
            makeupDescription: appearance.makeup_description || '',
            notes: appearance.notes || ''
          };
        });

        setCharacterData(dataMap);
      } catch (error) {
        console.error('Failed to load clothing data:', error);
      }
    };

    if (sceneId && characters.length > 0) {
      loadClothingData();
    }
  }, [sceneId, characters]);

  const getCurrentData = (characterId: string): ClothingData => {
    return characterData[characterId] || {
      clothingPrompt: '',
      referenceImages: [],
      accessories: [],
      hairStyle: '',
      makeupDescription: '',
      notes: ''
    };
  };

  const updateCharacterData = async (characterId: string, updates: Partial<ClothingData>) => {
    const current = getCurrentData(characterId);
    const updated = { ...current, ...updates };

    setCharacterData(prev => ({
      ...prev,
      [characterId]: updated
    }));

    // Save to database
    try {
      // Cast to any since character_scene_appearances table may not be in generated types
      const { error } = await (supabase as any)
        .from('character_scene_appearances')
        .upsert({
          character_id: characterId,
          scene_id: sceneId,
          clothing_prompt: updated.clothingPrompt,
          clothing_reference_images: updated.referenceImages.map(img => img.url),
          accessories: updated.accessories,
          hair_style: updated.hairStyle,
          makeup_description: updated.makeupDescription,
          notes: updated.notes
        }, {
          onConflict: 'character_id,scene_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save clothing data:', error);
      toast.error('Failed to save clothing details');
    }
  };

  const addAccessory = (characterId: string, accessory: string) => {
    const current = getCurrentData(characterId);
    updateCharacterData(characterId, {
      accessories: [...current.accessories, accessory]
    });
  };

  const removeAccessory = (characterId: string, index: number) => {
    const current = getCurrentData(characterId);
    updateCharacterData(characterId, {
      accessories: current.accessories.filter((_, i) => i !== index)
    });
  };

  if (characters.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="space-y-2">
      <CollapsibleTrigger asChild>
        <motion.div
          className={cn(
            "flex items-center justify-between cursor-pointer py-2 px-3 rounded-lg",
            "hover:bg-zinc-800/30 transition-all duration-200",
            "border border-transparent hover:border-zinc-700/50"
          )}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center
              shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Clothing & Appearance</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </motion.div>
        </motion.div>
      </CollapsibleTrigger>

      <AnimatePresence initial={false}>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-5 pt-2"
            >
              <Tabs
                value={selectedCharacterId}
                onValueChange={setSelectedCharacterId}
                className="w-full"
              >
                <TabsList className="w-full justify-start h-auto flex-wrap bg-zinc-900/50 p-1">
                  {characters.map((char) => (
                    <TabsTrigger
                      key={char.id}
                      value={char.id}
                      className="data-[state=active]:bg-amber-600/20 data-[state=active]:border-amber-500/50"
                    >
                      <Avatar className="w-5 h-5 mr-1.5">
                        <AvatarImage src={char.image_url || undefined} />
                      </Avatar>
                      <span className="text-xs">{char.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {characters.map((char) => {
                  const data = getCurrentData(char.id);
                  return (
                    <TabsContent key={char.id} value={char.id} className="space-y-3 mt-3">
                      {/* Clothing Description */}
                      <div>
                        <Label className="text-xs text-zinc-400">Clothing Description</Label>
                        <Textarea
                          value={data.clothingPrompt}
                          onChange={(e) =>
                            updateCharacterData(char.id, { clothingPrompt: e.target.value })
                          }
                          placeholder="Describe the character's outfit... e.g., 'Worn leather jacket, faded blue jeans, combat boots'"
                          className="mt-1 text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                          rows={2}
                        />
                      </div>

                      {/* Accessories */}
                      <div>
                        <Label className="text-xs text-zinc-400">Accessories</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                            placeholder="e.g., watch, necklace, hat..."
                            className="text-sm h-8 bg-zinc-900/50 border-zinc-800/50"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addAccessory(char.id, e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {data.accessories.map((accessory, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-amber-950/50 border-amber-500/30 hover:bg-amber-900/50 cursor-pointer"
                              onClick={() => removeAccessory(char.id, index)}
                            >
                              {accessory} ×
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Hair & Makeup */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-zinc-400">Hair Style</Label>
                          <Input
                            value={data.hairStyle}
                            onChange={(e) =>
                              updateCharacterData(char.id, { hairStyle: e.target.value })
                            }
                            placeholder="e.g., Slicked back..."
                            className="mt-1 text-sm h-8 bg-zinc-900/50 border-zinc-800/50"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-400">Makeup/Face</Label>
                          <Input
                            value={data.makeupDescription}
                            onChange={(e) =>
                              updateCharacterData(char.id, { makeupDescription: e.target.value })
                            }
                            placeholder="e.g., Natural, smokey..."
                            className="mt-1 text-sm h-8 bg-zinc-900/50 border-zinc-800/50"
                          />
                        </div>
                      </div>

                      {/* Reference Images */}
                      <div>
                        <Label className="text-xs text-zinc-400">Reference Images</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {data.referenceImages.map((img, idx) => (
                            <div key={img.id} className="relative group aspect-square">
                              <img
                                src={img.url}
                                alt="Reference"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  updateCharacterData(char.id, {
                                    referenceImages: data.referenceImages.filter((_, i) => i !== idx)
                                  });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}

                          {/* Add reference image */}
                          <Button
                            variant="outline"
                            className="aspect-square border-dashed border-2 hover:border-primary bg-zinc-900/30"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (!file) return;

                                try {
                                  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                  const { error: uploadError } = await supabase.storage
                                    .from('user-uploads')
                                    .upload(`references/${fileName}`, file);

                                  if (uploadError) throw uploadError;

                                  const { data: { publicUrl } } = supabase.storage
                                    .from('user-uploads')
                                    .getPublicUrl(`references/${fileName}`);

                                  updateCharacterData(char.id, {
                                    referenceImages: [...data.referenceImages, {
                                      id: `img-${Date.now()}`,
                                      url: publicUrl
                                    }]
                                  });

                                  toast.success('Reference image uploaded');
                                } catch (error) {
                                  console.error('Upload failed:', error);
                                  toast.error('Failed to upload image');
                                }
                              };
                              input.click();
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
