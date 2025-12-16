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

      // Use streaming via fal-stream edge function
      const result = await this.streamGenerate(
        modelId,
        {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          image_size: params.imageSize || 'landscape_4_3',
          num_inference_steps: params.numInferenceSteps || 28,
          guidance_scale: params.guidanceScale || 3.5,
          seed: params.seed,
        },
        onProgress
      )

      const imageUrl = result.images?.[0]?.url
      const imageWidth = result.images?.[0]?.width || 1024
      const imageHeight = result.images?.[0]?.height || 1024

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

  private async streamGenerate(
    modelId: string,
    inputs: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const response = await fetch(
      'https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/fal-stream',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
        },
        body: JSON.stringify({ modelId, inputs }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Streaming generation failed: ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let result: any = null
    let progressValue = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

      for (const line of lines) {
        try {
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue
          
          const event = JSON.parse(jsonStr)
          
          if (event.type === 'progress' && event.event) {
            // Update progress based on queue/processing status
            if (event.event.status === 'IN_QUEUE') {
              progressValue = 10
            } else if (event.event.status === 'IN_PROGRESS') {
              progressValue = Math.min(90, progressValue + 10)
            }
            onProgress?.(progressValue)
          } else if (event.type === 'done' && event.result) {
            result = event.result
            onProgress?.(100)
          } else if (event.type === 'error') {
            throw new Error(event.error)
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    if (!result) {
      throw new Error('No result received from stream')
    }

    return result
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

      // Use streaming via fal-stream edge function
      const result = await this.streamGenerate(
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
        onProgress
      )

      const imageUrl = result.images?.[0]?.url
      const imageWidth = result.images?.[0]?.width || 1024
      const imageHeight = result.images?.[0]?.height || 1024

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
