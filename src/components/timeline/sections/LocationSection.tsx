import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LocationData {
  name: string;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'golden_hour' | 'blue_hour' | '';
  weather: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy' | '';
  atmosphere: string;
  specificElements: string[];
  cameraEnvironment: string;
}

interface LocationSectionProps {
  sceneId: string;
  initialData?: Partial<LocationData>;
  onUpdate: (data: LocationData) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const TIME_OF_DAY_OPTIONS = [
  { value: 'dawn', label: '🌅 Dawn', description: 'Early morning twilight' },
  { value: 'morning', label: '☀️ Morning', description: 'Bright morning light' },
  { value: 'noon', label: '🌤️ Noon', description: 'Midday sun overhead' },
  { value: 'afternoon', label: '🌞 Afternoon', description: 'Warm afternoon light' },
  { value: 'golden_hour', label: '🌇 Golden Hour', description: 'Warm, soft sunset' },
  { value: 'dusk', label: '🌆 Dusk', description: 'Evening twilight' },
  { value: 'night', label: '🌙 Night', description: 'Darkness, moonlight' },
  { value: 'blue_hour', label: '🌃 Blue Hour', description: 'Deep blue twilight' },
];

const WEATHER_OPTIONS = [
  { value: 'clear', label: '☀️ Clear', icon: '☀️' },
  { value: 'cloudy', label: '☁️ Cloudy', icon: '☁️' },
  { value: 'rainy', label: '🌧️ Rainy', icon: '🌧️' },
  { value: 'stormy', label: '⛈️ Stormy', icon: '⛈️' },
  { value: 'snowy', label: '❄️ Snowy', icon: '❄️' },
  { value: 'foggy', label: '🌫️ Foggy', icon: '🌫️' },
  { value: 'windy', label: '💨 Windy', icon: '💨' },
];

export function LocationSection({
  sceneId,
  initialData = {},
  onUpdate,
  isOpen = true,
  onToggle
}: LocationSectionProps) {
  const [data, setData] = useState<LocationData>({
    name: initialData.name || '',
    timeOfDay: initialData.timeOfDay || '',
    weather: initialData.weather || '',
    atmosphere: initialData.atmosphere || '',
    specificElements: initialData.specificElements || [],
    cameraEnvironment: initialData.cameraEnvironment || '',
  });

  const [elementInput, setElementInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Build prompt context from location data
  const buildPromptContext = (locationData: LocationData): string => {
    const elements = [
      locationData.name,
      locationData.timeOfDay && `${locationData.timeOfDay.replace('_', ' ')} lighting`,
      locationData.weather && `${locationData.weather} weather conditions`,
      locationData.atmosphere,
      ...locationData.specificElements,
      locationData.cameraEnvironment && `shot from ${locationData.cameraEnvironment}`
    ].filter(Boolean);

    return elements.join(', ');
  };

  // Update prompt whenever data changes
  useEffect(() => {
    const prompt = buildPromptContext(data);
    setGeneratedPrompt(prompt);
  }, [data]);

  // Update parent and database
  const handleDataChange = async (updates: Partial<LocationData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onUpdate(newData);

    // Save to database
    try {
      const locationDetails = {
        name: newData.name,
        time_of_day: newData.timeOfDay,
        weather: newData.weather,
        atmosphere: newData.atmosphere,
        specific_elements: newData.specificElements,
        camera_environment: newData.cameraEnvironment,
      };

      // Cast to any since location_details column may not be in generated types
      const { error } = await (supabase as any)
        .from('scenes')
        .update({
          location_details: locationDetails,
          location_prompt_context: buildPromptContext(newData)
        })
        .eq('id', sceneId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save location data:', error);
      toast.error('Failed to save location details');
    }
  };

  const addElement = () => {
    if (elementInput.trim()) {
      handleDataChange({
        specificElements: [...data.specificElements, elementInput.trim()]
      });
      setElementInput('');
    }
  };

  const removeElement = (index: number) => {
    handleDataChange({
      specificElements: data.specificElements.filter((_, i) => i !== index)
    });
  };

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
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Location</span>
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
              className="space-y-3 pl-5 pt-2"
            >
              {/* Location Name */}
              <div>
                <Label className="text-xs text-zinc-400">Location Name</Label>
                <Input
                  value={data.name}
                  onChange={(e) => handleDataChange({ name: e.target.value })}
                  placeholder="e.g., Cyberpunk Tokyo Street, Mountain Valley..."
                  className="mt-1 text-sm h-9 bg-zinc-900/50 border-zinc-800/50"
                />
              </div>

              {/* Time of Day */}
              <div>
                <Label className="text-xs text-zinc-400">Time of Day</Label>
                <Select
                  value={data.timeOfDay}
                  onValueChange={(value: any) => handleDataChange({ timeOfDay: value })}
                >
                  <SelectTrigger className="mt-1 h-9 bg-zinc-900/50 border-zinc-800/50">
                    <SelectValue placeholder="Select time..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OF_DAY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          <span className="text-xs text-zinc-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weather */}
              <div>
                <Label className="text-xs text-zinc-400">Weather</Label>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {WEATHER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={data.weather === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDataChange({ weather: option.value as any })}
                      className={cn(
                        "h-8 text-xs",
                        data.weather === option.value
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-zinc-900/50 border-zinc-800/50"
                      )}
                    >
                      {option.icon}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Atmosphere */}
              <div>
                <Label className="text-xs text-zinc-400">Atmosphere</Label>
                <Textarea
                  value={data.atmosphere}
                  onChange={(e) => handleDataChange({ atmosphere: e.target.value })}
                  placeholder="e.g., neon-lit, crowded, tense and quiet..."
                  className="mt-1 text-sm min-h-[60px] bg-zinc-900/50 border-zinc-800/50"
                  rows={2}
                />
              </div>

              {/* Specific Elements */}
              <div>
                <Label className="text-xs text-zinc-400">Specific Elements</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    value={elementInput}
                    onChange={(e) => setElementInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addElement()}
                    placeholder="e.g., holographic billboards, flying cars..."
                    className="text-sm h-8 bg-zinc-900/50 border-zinc-800/50"
                  />
                  <Button size="sm" onClick={addElement} className="h-8 px-3">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.specificElements.map((element, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-blue-950/50 border-blue-500/30 hover:bg-blue-900/50 cursor-pointer"
                      onClick={() => removeElement(index)}
                    >
                      {element} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Camera Environment */}
              <div>
                <Label className="text-xs text-zinc-400">Camera Environment</Label>
                <Input
                  value={data.cameraEnvironment}
                  onChange={(e) => handleDataChange({ cameraEnvironment: e.target.value })}
                  placeholder="e.g., street level with reflections, aerial view..."
                  className="mt-1 text-sm h-9 bg-zinc-900/50 border-zinc-800/50"
                />
              </div>

              {/* Generated Prompt Preview */}
              {generatedPrompt && (
                <div className="mt-3 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <Label className="text-xs text-blue-400">Generated Prompt Context</Label>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {generatedPrompt}
                  </p>
                </div>
              )}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
