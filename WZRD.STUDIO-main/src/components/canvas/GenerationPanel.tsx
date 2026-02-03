import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Settings, History, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useGeneration } from '@/hooks/useGeneration'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { GenerationProgress } from './GenerationProgress'
import { GenerationHistory } from './GenerationHistory'
import type { ImageData } from '@/types/canvas'

export function GenerationPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [imageSize, setImageSize] = useState<'square_hd' | 'portrait_4_3' | 'landscape_4_3' | 'portrait_16_9' | 'landscape_16_9'>('landscape_4_3')
  const [steps, setSteps] = useState(28)
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [strength, setStrength] = useState(0.85)

  const { isGenerating, progress, currentPrompt, generateTextToImage, generateImageToImage } = useGeneration()
  const { objects, selectedIds } = useCanvasStore()

  const selectedObjects = objects.filter((obj) => selectedIds.includes(obj.id) && obj.type === 'image')
  const isImageToImage = selectedObjects.length > 0

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    if (isImageToImage && selectedObjects[0]) {
      // Image-to-image for selected images
      const imageData = selectedObjects[0].data as ImageData
      await generateImageToImage({
        imageUrl: imageData.url,
        prompt,
        negativePrompt,
        strength,
        numInferenceSteps: steps,
        guidanceScale,
      })
    } else {
      // Text-to-image
      await generateTextToImage({
        prompt,
        negativePrompt,
        imageSize,
        numInferenceSteps: steps,
        guidanceScale,
      })
    }
  }

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[650px]"
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Generation</h3>
                <p className="text-xs text-muted-foreground">
                  {isImageToImage ? `Transform ${selectedObjects.length} image(s)` : 'Create from text'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHistory(true)
                }}
                className="h-8 w-8 hover:bg-accent"
              >
                <History className="w-4 h-4" />
              </Button>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-sm text-foreground">
                      Prompt
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        isImageToImage
                          ? 'Describe how you want to transform the selected image...'
                          : 'Describe the image you want to create...'
                      }
                      className="min-h-[80px] bg-background/50 border-border resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleGenerate()
                        }
                      }}
                    />
                  </div>

                  {/* Quick Settings */}
                  {!isImageToImage && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Image Size</Label>
                        <Select value={imageSize} onValueChange={(v: any) => setImageSize(v)}>
                          <SelectTrigger className="bg-background/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square_hd">Square (1:1)</SelectItem>
                            <SelectItem value="landscape_4_3">Landscape (4:3)</SelectItem>
                            <SelectItem value="portrait_4_3">Portrait (3:4)</SelectItem>
                            <SelectItem value="landscape_16_9">Landscape (16:9)</SelectItem>
                            <SelectItem value="portrait_16_9">Portrait (9:16)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Image-to-Image Strength */}
                  {isImageToImage && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Transformation Strength</Label>
                        <span className="text-xs text-foreground font-medium">{strength.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[strength]}
                        onValueChange={([v]) => setStrength(v)}
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values keep more of the original image
                      </p>
                    </div>
                  )}

                  {/* Advanced Settings */}
                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-accent">
                        <span className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Advanced Settings
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      {/* Negative Prompt */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Negative Prompt</Label>
                        <Input
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          placeholder="What to avoid in the image..."
                          className="bg-background/50 border-border"
                        />
                      </div>

                      {/* Steps */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Inference Steps</Label>
                          <span className="text-xs text-foreground font-medium">{steps}</span>
                        </div>
                        <Slider
                          value={[steps]}
                          onValueChange={([v]) => setSteps(v)}
                          min={10}
                          max={50}
                          step={1}
                        />
                      </div>

                      {/* Guidance Scale */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Guidance Scale</Label>
                          <span className="text-xs text-foreground font-medium">{guidanceScale.toFixed(1)}</span>
                        </div>
                        <Slider
                          value={[guidanceScale]}
                          onValueChange={([v]) => setGuidanceScale(v)}
                          min={1}
                          max={20}
                          step={0.5}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {isImageToImage ? `Transform ${selectedObjects.length} Image(s)` : 'Generate Image'}
                      </>
                    )}
                  </Button>

                  {/* Keyboard Hint */}
                  <p className="text-xs text-center text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Cmd/Ctrl + Enter</kbd> to generate
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Generation Progress */}
      <GenerationProgress isGenerating={isGenerating} progress={progress} prompt={currentPrompt} />

      {/* Generation History */}
      <GenerationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  )
}
