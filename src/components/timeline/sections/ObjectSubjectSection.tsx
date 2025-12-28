import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ChevronDown, Plus, Trash2, ZoomIn } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SceneObject {
  id: string;
  name: string;
  description: string;
  promptContext: string;
  referenceImages: string[];
  importanceLevel: 'hero' | 'featured' | 'background';
  positionHint: string;
}

interface ObjectSubjectSectionProps {
  sceneId: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function ObjectSubjectSection({
  sceneId,
  enabled: initialEnabled = false,
  onToggle
}: ObjectSubjectSectionProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [expandedObjectId, setExpandedObjectId] = useState<string | null>(null);

  // Load objects from database
  useEffect(() => {
    const loadObjects = async () => {
      try {
        // Cast to any since scene_objects table may not be in generated types
        const { data, error } = await (supabase as any)
          .from('scene_objects')
          .select('*')
          .eq('scene_id', sceneId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setObjects(
          (data || []).map((obj: any) => ({
            id: obj.id,
            name: obj.name,
            description: obj.description || '',
            promptContext: obj.prompt_context || '',
            referenceImages: obj.reference_images || [],
            importanceLevel: obj.importance_level as any || 'background',
            positionHint: obj.position_hint || ''
          }))
        );
      } catch (error) {
        console.error('Failed to load scene objects:', error);
      }
    };

    // Load enabled state from scene
    const loadEnabledState = async () => {
      try {
        // Cast to any since enabled_sections column may not be in generated types
        const { data, error } = await (supabase as any)
          .from('scenes')
          .select('enabled_sections')
          .eq('id', sceneId)
          .single();

        if (error) throw error;

        const enabledSections = data?.enabled_sections || {};
        setEnabled(enabledSections.objects || false);
      } catch (error) {
        console.error('Failed to load enabled state:', error);
      }
    };

    if (sceneId) {
      loadObjects();
      loadEnabledState();
    }
  }, [sceneId]);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    onToggle?.(checked);

    // Update database
    try {
      // Cast to any since enabled_sections column may not be in generated types
      const { data: scene } = await (supabase as any)
        .from('scenes')
        .select('enabled_sections')
        .eq('id', sceneId)
        .single();

      const enabledSections = scene?.enabled_sections || {};

      const { error } = await (supabase as any)
        .from('scenes')
        .update({
          enabled_sections: {
            ...enabledSections,
            objects: checked
          }
        })
        .eq('id', sceneId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update enabled state:', error);
      toast.error('Failed to save settings');
    }
  };

  const addNewObject = async () => {
    try {
      // Cast to any since scene_objects table may not be in generated types
      const { data, error } = await (supabase as any)
        .from('scene_objects')
        .insert({
          scene_id: sceneId,
          name: 'Unnamed Object',
          importance_level: 'background'
        })
        .select()
        .single();

      if (error) throw error;

      const newObject: SceneObject = {
        id: data.id,
        name: data.name,
        description: '',
        promptContext: '',
        referenceImages: [],
        importanceLevel: 'background',
        positionHint: ''
      };

      setObjects([...objects, newObject]);
      setExpandedObjectId(newObject.id);
      toast.success('Object added');
    } catch (error) {
      console.error('Failed to add object:', error);
      toast.error('Failed to add object');
    }
  };

  const updateObject = async (objectId: string, updates: Partial<SceneObject>) => {
    setObjects(prev => prev.map(obj =>
      obj.id === objectId ? { ...obj, ...updates } : obj
    ));

    // Save to database
    try {
      // Cast to any since scene_objects table may not be in generated types
      const { error } = await (supabase as any)
        .from('scene_objects')
        .update({
          name: updates.name,
          description: updates.description,
          prompt_context: updates.promptContext,
          reference_images: updates.referenceImages,
          importance_level: updates.importanceLevel,
          position_hint: updates.positionHint
        })
        .eq('id', objectId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update object:', error);
      toast.error('Failed to save changes');
    }
  };

  const deleteObject = async (objectId: string) => {
    try {
      // Cast to any since scene_objects table may not be in generated types
      const { error } = await (supabase as any)
        .from('scene_objects')
        .delete()
        .eq('id', objectId);

      if (error) throw error;

      setObjects(prev => prev.filter(obj => obj.id !== objectId));
      toast.success('Object deleted');
    } catch (error) {
      console.error('Failed to delete object:', error);
      toast.error('Failed to delete object');
    }
  };

  const getImportanceBadgeVariant = (level: string) => {
    switch (level) {
      case 'hero': return 'default';
      case 'featured': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      {/* Toggle Header */}
      <div className="flex items-center justify-between p-3 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enable-objects"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor="enable-objects" className="flex items-center gap-2 cursor-pointer text-sm">
            <Box className="w-4 h-4 text-green-400" />
            Objects & Props Reference
          </Label>
        </div>
        {enabled && (
          <Button size="sm" variant="ghost" onClick={addNewObject} className="h-7">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Object
          </Button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {objects.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No objects added</p>
                  <p className="text-xs mt-1">Add props, vehicles, or key objects for this scene</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {objects.map((obj) => {
                    const isExpanded = expandedObjectId === obj.id;
                    return (
                      <Card key={obj.id} className="bg-zinc-900/30 border-zinc-800">
                        <CardHeader className="p-2 cursor-pointer" onClick={() => setExpandedObjectId(isExpanded ? null : obj.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getImportanceBadgeVariant(obj.importanceLevel)} className="text-xs">
                                {obj.importanceLevel}
                              </Badge>
                              <span className="text-sm font-medium">{obj.name || 'Unnamed Object'}</span>
                            </div>
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <CardContent className="p-3 pt-0 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-zinc-400">Name</Label>
                                    <Input
                                      value={obj.name}
                                      onChange={(e) => updateObject(obj.id, { name: e.target.value })}
                                      className="h-8 text-sm bg-zinc-900/50"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-zinc-400">Importance</Label>
                                    <Select
                                      value={obj.importanceLevel}
                                      onValueChange={(v: any) => updateObject(obj.id, { importanceLevel: v })}
                                    >
                                      <SelectTrigger className="h-8 text-sm bg-zinc-900/50">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="hero">Hero (Main Focus)</SelectItem>
                                        <SelectItem value="featured">Featured (Notable)</SelectItem>
                                        <SelectItem value="background">Background (Set Dressing)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-xs text-zinc-400">Prompt Context</Label>
                                  <Textarea
                                    value={obj.promptContext}
                                    onChange={(e) => updateObject(obj.id, { promptContext: e.target.value })}
                                    placeholder="Detailed description for AI generation..."
                                    className="text-sm min-h-[50px] bg-zinc-900/50"
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs text-zinc-400">Position Hint</Label>
                                  <Select
                                    value={obj.positionHint}
                                    onValueChange={(v) => updateObject(obj.id, { positionHint: v })}
                                  >
                                    <SelectTrigger className="h-8 text-sm bg-zinc-900/50">
                                      <SelectValue placeholder="Where in the frame?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="foreground-center">Foreground Center</SelectItem>
                                      <SelectItem value="foreground-left">Foreground Left</SelectItem>
                                      <SelectItem value="foreground-right">Foreground Right</SelectItem>
                                      <SelectItem value="midground">Midground</SelectItem>
                                      <SelectItem value="background">Background</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex justify-end pt-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteObject(obj.id)}
                                    className="h-7"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                                  </Button>
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
