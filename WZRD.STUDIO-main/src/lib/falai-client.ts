import { supabase } from '@/integrations/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface FalAIClientOptions {
  onProgress?: (progress: number) => void
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

export interface FalStreamEvent {
  type: 'progress' | 'done' | 'error'
  event?: {
    status?: string
    progress?: number
    queue_position?: number
    logs?: string[]
  }
  result?: any
  error?: string
}

export interface FalStreamOptions {
  onProgress?: (event: FalStreamEvent) => void
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

export interface FalAIExecuteOptions {
  metadata?: {
    projectId?: string
    nodeId?: string
    source?: 'node-editor' | 'storyboard' | 'timeline'
  }
}

export class FalAIClient {
  private channel: RealtimeChannel | null = null

  async execute(
    modelId: string,
    inputs: Record<string, any>,
    options?: FalAIClientOptions & FalAIExecuteOptions
  ) {
    try {
      // Call generic edge function
      const { data, error } = await supabase.functions.invoke('falai-execute', {
        body: { 
          modelId, 
          inputs,
          metadata: options?.metadata
        },
      })

      if (error) throw error

      // For async models, subscribe to updates
      if (data.requestId && options) {
        this.subscribeToUpdates(data.requestId, options)
      }

      return data
    } catch (error) {
      options?.onError?.(error as Error)
      throw error
    }
  }

  async generateImage(
    prompt: string, 
    options?: { 
      modelId?: string
      image_size?: string
      num_images?: number
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || 'fal-ai/flux/dev'
    
    // Validate model supports text-to-image generation
    const incompatibleModels = ['fal-ai/trellis/multi', 'fal-ai/trellis']
    if (incompatibleModels.some(id => modelId.includes(id))) {
      const error = new Error(`Model ${modelId} is a 3D generation model and cannot be used for image generation. Please select an image generation model like FLUX or Ideogram.`)
      options?.onError?.(error)
      return {
        success: false,
        error: error.message
      }
    }
    
    const inputs = {
      prompt,
      image_size: options?.image_size || '1024x1024',
      num_images: options?.num_images || 1,
    }

    return this.execute(modelId, inputs, options)
  }

  async generateVideo(
    prompt: string,
    options?: {
      modelId?: string
      image_url?: string
      aspect_ratio?: string
      duration?: number
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    // Auto-select model based on whether image is provided
    let modelId = options?.modelId
    if (!modelId) {
      modelId = options?.image_url 
        ? 'fal-ai/magi/image-to-video'
        : 'fal-ai/magi'
    }

    const inputs: Record<string, any> = { prompt }
    if (options?.image_url) inputs.image_url = options.image_url
    if (options?.aspect_ratio) inputs.aspect_ratio = options.aspect_ratio
    if (options?.duration) inputs.duration = options.duration

    return this.execute(modelId, inputs, options)
  }

  async generateAudio(
    prompt: string,
    options?: {
      modelId?: string
      duration?: number
      instrumental?: boolean
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || 'cassetteai/music-generator'
    const inputs = {
      prompt,
      duration: options?.duration || 30,
      instrumental: options?.instrumental
    }

    return this.execute(modelId, inputs, options)
  }

  async enhanceImage(
    imageUrl: string,
    options?: {
      modelId?: string
      upscale_factor?: number
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || 'fal-ai/recraft/upscale/creative'
    const inputs = {
      image_url: imageUrl,
      upscale_factor: options?.upscale_factor || 2
    }

    return this.execute(modelId, inputs, options)
  }

  async editImage(
    imageUrl: string,
    prompt: string,
    options?: {
      modelId?: string
      maskUrl?: string
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || 'fal-ai/step1x-edit'
    const inputs: Record<string, any> = {
      image_url: imageUrl,
      prompt
    }
    
    if (options?.maskUrl) inputs.mask_url = options.maskUrl

    return this.execute(modelId, inputs, options)
  }

  async speechToText(
    audioUrl: string,
    options?: {
      modelId?: string
      turbo?: boolean
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || (options?.turbo 
      ? 'fal-ai/speech-to-text/turbo'
      : 'fal-ai/speech-to-text')
    
    return this.execute(modelId, { audio_url: audioUrl }, options)
  }

  async textToSpeech(
    text: string,
    options?: {
      modelId?: string
      voiceId?: string
    } & FalAIClientOptions & FalAIExecuteOptions
  ) {
    const modelId = options?.modelId || 'fal-ai/dia-tts'
    const inputs = {
      text,
      voice_id: options?.voiceId
    }

    return this.execute(modelId, inputs, options)
  }

  // Get available models by category
  async getModels(category?: string) {
    const { data, error } = await supabase.functions.invoke('falai-models', {
      body: { category }
    })

    if (error) throw error
    return data
  }

  // Poll status for async operations
  async pollStatus(requestId: string) {
    const { data, error } = await supabase.functions.invoke('fal-poll', {
      body: { requestId }
    })

    if (error) throw error
    return data
  }

  private subscribeToUpdates(
    requestId: string,
    options: FalAIClientOptions
  ) {
    this.channel = supabase
      .channel(`falai-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'falai_job_updates',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          const update = payload.new
          if (update.status === 'completed') {
            options.onComplete?.(update.output)
            this.cleanup()
          } else if (update.status === 'failed') {
            options.onError?.(new Error(update.error || 'Unknown error'))
            this.cleanup()
          } else if (update.status === 'processing' && update.progress) {
            options.onProgress?.(update.progress)
          }
        }
      )
      .subscribe()
  }

  private cleanup() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }

  // Stream generation with real-time progress updates
  async streamGenerate(
    modelId: string,
    inputs: Record<string, any>,
    options?: FalStreamOptions
  ): Promise<any> {
    const SUPABASE_URL = 'https://ixkkrousepsiorwlaycp.supabase.co'
    
    try {
      console.log('🚀 Starting streaming generation:', modelId)
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fal-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId, inputs })
      })

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result: any = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as FalStreamEvent
              
              if (data.type === 'progress') {
                console.log('📡 Progress event:', data.event)
                options?.onProgress?.(data)
              } else if (data.type === 'done') {
                console.log('✅ Generation complete')
                result = data.result
                options?.onComplete?.(data.result)
              } else if (data.type === 'error') {
                console.error('❌ Stream error:', data.error)
                options?.onError?.(new Error(data.error || 'Unknown error'))
              }
            } catch (parseError) {
              // Ignore parse errors for partial data
            }
          }
        }
      }

      return result
    } catch (error) {
      console.error('Stream generation error:', error)
      options?.onError?.(error as Error)
      throw error
    }
  }

  // Stream image generation with progress
  async streamGenerateImage(
    prompt: string,
    options?: {
      modelId?: string
      image_size?: string
      num_images?: number
      guidance_scale?: number
      num_inference_steps?: number
    } & FalStreamOptions
  ): Promise<any> {
    const modelId = options?.modelId || 'fal-ai/flux/dev'
    
    const inputs = {
      prompt,
      image_size: options?.image_size || 'landscape_4_3',
      num_images: options?.num_images || 1,
      guidance_scale: options?.guidance_scale || 3.5,
      num_inference_steps: options?.num_inference_steps || 28,
      enable_safety_checker: true,
      output_format: 'png'
    }

    return this.streamGenerate(modelId, inputs, {
      onProgress: options?.onProgress,
      onComplete: options?.onComplete,
      onError: options?.onError
    })
  }

  // Specialized functions for common use cases in storyboard and timeline
  async generateStoryboardFrame(
    prompt: string,
    frameIndex: number,
    options?: {
      style?: string
      aspectRatio?: string
    }
  ) {
    return this.generateImage(prompt, {
      ...options,
      metadata: {
        source: 'storyboard',
        nodeId: `frame-${frameIndex}`
      }
    })
  }

  async generateTimelineClip(
    prompt: string,
    duration: number,
    options?: {
      imageUrl?: string
      trackId?: string
    }
  ) {
    return this.generateVideo(prompt, {
      duration,
      image_url: options?.imageUrl,
      metadata: {
        source: 'timeline',
        nodeId: options?.trackId
      }
    })
  }
}

// Export singleton instance
export const falAI = new FalAIClient()

// Export model categories for UI components
export const FAL_MODEL_CATEGORIES = [
  'image-generation',
  'video-generation',
  'audio-generation',
  'image-editing',
  'speech-processing',
  'vision-language',
  '3d-generation',
  'enhancement'
] as const

export type FalModelCategory = typeof FAL_MODEL_CATEGORIES[number]