import { useState, useCallback } from 'react'
import { generationService, type GenerationParams, type ImageToImageParams } from '@/services/generationService'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { toast } from 'sonner'

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPrompt, setCurrentPrompt] = useState('')
  
  const { addObject, viewport } = useCanvasStore()

  const generateTextToImage = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentPrompt(params.prompt)

    try {
      const result = await generationService.textToImage(params, (p) => {
        setProgress(p)
      })

      if (result.status === 'failed') {
        toast.error(`Generation failed: ${result.error}`)
        return null
      }

      // Add to canvas at center of viewport
      const canvasObject = generationService.createCanvasObject(result, {
        x: -viewport.x / viewport.scale + 400,
        y: -viewport.y / viewport.scale + 300,
      })

      addObject(canvasObject)
      toast.success('Image generated successfully!')

      return result
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`)
      return null
    } finally {
      setIsGenerating(false)
      setProgress(0)
      setCurrentPrompt('')
    }
  }, [addObject, viewport])

  const generateImageToImage = useCallback(async (params: ImageToImageParams) => {
    setIsGenerating(true)
    setProgress(0)
    setCurrentPrompt(params.prompt)

    try {
      const result = await generationService.imageToImage(params, (p) => {
        setProgress(p)
      })

      if (result.status === 'failed') {
        toast.error(`Generation failed: ${result.error}`)
        return null
      }

      // Add to canvas near the source image
      const canvasObject = generationService.createCanvasObject(result, {
        x: -viewport.x / viewport.scale + 400,
        y: -viewport.y / viewport.scale + 300,
      })

      addObject(canvasObject)
      toast.success('Image transformed successfully!')

      return result
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`)
      return null
    } finally {
      setIsGenerating(false)
      setProgress(0)
      setCurrentPrompt('')
    }
  }, [addObject, viewport])

  return {
    isGenerating,
    progress,
    currentPrompt,
    generateTextToImage,
    generateImageToImage,
  }
}
