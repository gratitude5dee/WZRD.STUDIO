import { supabase } from '@/integrations/supabase/client';

export interface NodeExecutionInput {
  nodeId: string;
  nodeType: string;
  inputs: Record<string, any>;
  params: Record<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  outputs?: Record<string, any>;
  error?: string;
}

/**
 * Client-side node executor that triggers backend execution
 */
export class NodeExecutor {
  /**
   * Execute a single node locally (for immediate feedback)
   */
  static async executeNodeLocally(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      const { nodeType, inputs, params } = input;
      
      // Input nodes can execute immediately
      if (nodeType.includes('input')) {
        return {
          success: true,
          outputs: {
            'text-out': params.value || '',
            'image-out': params.imageUrl ? { url: params.imageUrl } : undefined,
          },
        };
      }

      // Generation nodes need backend execution
      return {
        success: false,
        error: 'Generation nodes require workflow execution',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate node inputs before execution
   */
  static validateInputs(input: NodeExecutionInput): { valid: boolean; error?: string } {
    const { nodeType, inputs } = input;

    // Check for required inputs based on node type
    if (nodeType.includes('generate')) {
      if (nodeType.includes('text.generate')) {
        if (!inputs['text-in']) {
          return { valid: false, error: 'Text input required' };
        }
      }
      
      if (nodeType.includes('image.generate')) {
        if (!inputs['text-in']) {
          return { valid: false, error: 'Text prompt required for image generation' };
        }
      }

      if (nodeType.includes('video.generate')) {
        if (!inputs['image-in']) {
          return { valid: false, error: 'Image input required for video generation' };
        }
      }
    }

    return { valid: true };
  }
}
