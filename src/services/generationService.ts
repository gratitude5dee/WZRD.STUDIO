import { supabase } from '@/integrations/supabase/client'
import { FalAIClient } from '@/lib/falai-client'
import type { CanvasObject, ImageData } from '@/types/canvas'

export interface GenerationParams {
  prompt: string
  negativePrompt?: string
  imageSize?: 'square_hd' | 'portrait_4_3' | 'landscape_4_3' | 'portrait_16_9' | 'landscape_16_9'
  numInferenceSteps?: number
  guidanceScale?: number
  loraUrl?: string
  seed?: number
}

export interface ImageToImageParams extends GenerationParams {
  imageUrl: string
  strength?: number
}

export interface GenerationResult {
  id: string
  url: string
  width: number
  height: number
  prompt: string
  model: string
  status: 'completed' | 'failed'
  error?: string
}

class GenerationService {
  private falClient: FalAIClient

  constructor() {
    this.falClient = new FalAIClient()
  }

  async textToImage(
    params: GenerationParams,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const generationId = crypto.randomUUID()
    const modelId = 'fal-ai/flux/dev'

    try {
      // Log generation start
      await this.logGeneration(generationId, {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: modelId,
        status: 'pending',
        settings: params,
      })

      // Call FAL.ai
      const result = await this.falClient.execute(
        modelId,
        {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          image_size: params.imageSize || 'landscape_4_3',
          num_inference_steps: params.numInferenceSteps || 28,
          guidance_scale: params.guidanceScale || 3.5,
          seed: params.seed,
        },
        {
          onProgress: (progress) => {
            onProgress?.(progress)
          },
          onError: (error) => {
            this.logGeneration(generationId, { status: 'failed', error: error.message })
          },
        }
      )

      const imageUrl = result.images?.[0]?.url || result.data?.images?.[0]?.url
      const imageWidth = result.images?.[0]?.width || result.data?.images?.[0]?.width || 1024
      const imageHeight = result.images?.[0]?.height || result.data?.images?.[0]?.height || 1024

      if (!imageUrl) {
        throw new Error('No image URL returned from generation')
      }

      // Update generation log with result
      await this.logGeneration(generationId, {
        status: 'completed',
        outputImageUrl: imageUrl,
      })

      return {
        id: generationId,
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        prompt: params.prompt,
        model: modelId,
        status: 'completed',
      }
    } catch (error: any) {
      await this.logGeneration(generationId, {
        status: 'failed',
        error: error.message,
      })

      return {
        id: generationId,
        url: '',
        width: 0,
        height: 0,
        prompt: params.prompt,
        model: modelId,
        status: 'failed',
        error: error.message,
      }
    }
  }

  async imageToImage(
    params: ImageToImageParams,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const generationId = crypto.randomUUID()
    const modelId = 'fal-ai/flux/dev/image-to-image'

    try {
      // Log generation start
      await this.logGeneration(generationId, {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: modelId,
        status: 'pending',
        inputImageUrl: params.imageUrl,
        settings: params,
      })

      // Call FAL.ai
      const result = await this.falClient.execute(
        modelId,
        {
          image_url: params.imageUrl,
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          strength: params.strength || 0.85,
          num_inference_steps: params.numInferenceSteps || 28,
          guidance_scale: params.guidanceScale || 3.5,
          seed: params.seed,
        },
        {
          onProgress: (progress) => {
            onProgress?.(progress)
          },
          onError: (error) => {
            this.logGeneration(generationId, { status: 'failed', error: error.message })
          },
        }
      )

      const imageUrl = result.images?.[0]?.url || result.data?.images?.[0]?.url
      const imageWidth = result.images?.[0]?.width || result.data?.images?.[0]?.width || 1024
      const imageHeight = result.images?.[0]?.height || result.data?.images?.[0]?.height || 1024

      if (!imageUrl) {
        throw new Error('No image URL returned from generation')
      }

      // Update generation log with result
      await this.logGeneration(generationId, {
        status: 'completed',
        outputImageUrl: imageUrl,
      })

      return {
        id: generationId,
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        prompt: params.prompt,
        model: modelId,
        status: 'completed',
      }
    } catch (error: any) {
      await this.logGeneration(generationId, {
        status: 'failed',
        error: error.message,
      })

      return {
        id: generationId,
        url: '',
        width: 0,
        height: 0,
        prompt: params.prompt,
        model: modelId,
        status: 'failed',
        error: error.message,
      }
    }
  }

  async getGenerationHistory(limit = 20): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch generation history:', error)
      return []
    }
  }

  private async logGeneration(id: string, data: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('generations').upsert({
        id,
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to log generation:', error)
    }
  }

  createCanvasObject(
    generation: GenerationResult,
    position: { x: number; y: number }
  ): CanvasObject {
    return {
      id: crypto.randomUUID(),
      type: 'image',
      layerIndex: 0,
      transform: {
        x: position.x,
        y: position.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      visibility: true,
      locked: false,
      data: {
        url: generation.url,
        width: generation.width,
        height: generation.height,
      } as ImageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export const generationService = new GenerationService()
