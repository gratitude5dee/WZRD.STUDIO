export interface FalResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  requestId?: string
  logs?: any[]
}

export interface FalQueueStatus {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  response_url?: string
  queue_position?: number
  logs?: any[]
  result?: any
}

export async function executeFalModel<T>(
  modelId: string,
  inputs: Record<string, any>,
  mode: 'sync' | 'queue' = 'queue'
): Promise<FalResponse<T>> {
  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    console.log(`Executing Fal.AI model: ${modelId} with mode: ${mode}`)

    const response = await fetch(`https://fal.run/v1/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...inputs,
        mode,
      }),
    })

    const responseText = await response.text()
    console.log('Fal.AI response:', responseText)

    if (!response.ok) {
      let errorMessage
      try {
        const error = JSON.parse(responseText)
        errorMessage = error.message || error.error || `Failed to execute model (${response.status})`
      } catch {
        errorMessage = `Failed to execute model (${response.status}): ${responseText}`
      }
      throw new Error(errorMessage)
    }

    const result = JSON.parse(responseText)
    
    return {
      success: true,
      data: result,
      requestId: result.request_id,
      logs: result.logs,
    }
  } catch (error) {
    console.error('Fal.AI execution error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    }
  }
}

export async function pollFalStatus(requestId: string): Promise<FalResponse<any>> {
  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    })

    const responseText = await response.text()
    console.log('Fal.AI status response:', responseText)

    if (!response.ok) {
      let errorMessage
      try {
        const error = JSON.parse(responseText)
        errorMessage = error.message || error.error || 'Failed to check status from fal.ai'
      } catch {
        errorMessage = 'Failed to check status from fal.ai: ' + responseText
      }
      throw new Error(errorMessage)
    }

    const data = JSON.parse(responseText)
    
    return {
      success: true,
      data: {
        status: data.status,
        result: data.logs?.length ? data.logs[data.logs.length - 1]?.result : null,
        logs: data.logs,
        queue_position: data.queue_position,
      },
    }
  } catch (error) {
    console.error('Fal.AI status check error:', error)
    return {
      success: false,
      error: error.message || 'Failed to poll fal.ai status',
    }
  }
}

export interface ModelInfo {
  id: string
  name: string
  category: string
  description: string
  capabilities: string[]
  inputSchema: Record<string, any>
  outputSchema: Record<string, any>
  pricing?: {
    costPer1k?: number
    currency?: string
  }
}

export const COMMON_MODELS: ModelInfo[] = [
  {
    id: 'fal-ai/flux/dev',
    name: 'FLUX.1 [dev]',
    category: 'image-generation',
    description: 'High-quality text-to-image generation',
    capabilities: ['text-to-image', 'high-quality'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      image_size: { type: 'string', default: '1024x1024' },
      num_inference_steps: { type: 'number', default: 28 },
      guidance_scale: { type: 'number', default: 3.5 },
      num_images: { type: 'number', default: 1 },
      seed: { type: 'number', optional: true },
      enable_safety_checker: { type: 'boolean', default: true },
    },
    outputSchema: {
      images: { type: 'array', items: { url: 'string', width: 'number', height: 'number' } },
    },
  },
  {
    id: 'fal-ai/flux/schnell',
    name: 'FLUX.1 [schnell]',
    category: 'image-generation',
    description: 'Fast text-to-image generation',
    capabilities: ['text-to-image', 'fast'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      image_size: { type: 'string', default: '1024x1024' },
      num_inference_steps: { type: 'number', default: 4 },
      num_images: { type: 'number', default: 1 },
      seed: { type: 'number', optional: true },
    },
    outputSchema: {
      images: { type: 'array', items: { url: 'string', width: 'number', height: 'number' } },
    },
  },
  {
    id: 'fal-ai/luma-dream-machine',
    name: 'Luma Dream Machine',
    category: 'video-generation',
    description: 'Text and image to video generation',
    capabilities: ['text-to-video', 'image-to-video'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      aspect_ratio: { type: 'string', default: '16:9' },
      loop: { type: 'boolean', default: false },
    },
    outputSchema: {
      video: { type: 'object', properties: { url: 'string' } },
    },
  },
  {
    id: 'fal-ai/stable-audio',
    name: 'Stable Audio',
    category: 'audio-generation',
    description: 'Text-to-audio generation',
    capabilities: ['text-to-audio'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      duration: { type: 'number', default: 10 },
      sample_rate: { type: 'number', default: 44100 },
    },
    outputSchema: {
      audio_file: { type: 'object', properties: { url: 'string' } },
    },
  },
]