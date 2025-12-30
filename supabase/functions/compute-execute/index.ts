import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fal } from "https://esm.sh/@fal-ai/client@1.2.3";
import { 
  topoSort,
  collectInputs,
  extractOutputValue,
  normalizeInputValues,
  substituteVariables,
  hasFailedDependency,
  createSSEEvent,
  getSSEHeaders,
  ComputeNode,
  ComputeEdge
} from "../_shared/compute-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteRequest {
  projectId: string;
  nodeIds?: string[];
  useCache?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create supabase client with user token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('[ComputeExecute] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { projectId, nodeIds, useCache = true }: ExecuteRequest = await req.json();
    console.log('[ComputeExecute] Starting execution for project:', projectId);

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // First try to fetch from compute_nodes (new system)
    let { data: nodes, error: nodesError } = await supabaseClient
      .from('compute_nodes')
      .select('*')
      .eq('project_id', projectId);

    let { data: edges, error: edgesError } = await supabaseClient
      .from('compute_edges')
      .select('*')
      .eq('project_id', projectId);

    // If no compute_nodes found, fallback to studio_blocks (legacy system)
    if ((!nodes || nodes.length === 0) && !nodesError) {
      console.log('[ComputeExecute] No compute_nodes found, trying studio_blocks...');
      
      const { data: blocks, error: blocksError } = await supabaseClient
        .from('studio_blocks')
        .select('*')
        .eq('project_id', projectId);

      if (blocksError) {
        console.error('[ComputeExecute] Error fetching studio_blocks:', blocksError);
        return new Response(JSON.stringify({ error: 'Failed to fetch compute graph' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (blocks && blocks.length > 0) {
        // Transform studio_blocks to compute node format
        nodes = blocks.map((block: any, index: number) => ({
          id: block.id,
          project_id: block.project_id,
          user_id: block.user_id,
          kind: mapBlockTypeToKind(block.block_type),
          label: block.block_type || 'Block',
          position: { x: block.position_x || 0, y: block.position_y || 0 },
          params: {
            prompt: block.prompt,
            model: block.selected_model,
            imageUrl: block.generated_output_url,
            ...block.generation_metadata
          },
          inputs: [],
          outputs: [],
          status: 'idle',
          version: '1.0.0',
          created_at: block.created_at,
          updated_at: block.updated_at,
        }));
        edges = []; // No edges in studio_blocks system
        console.log('[ComputeExecute] Transformed', nodes.length, 'studio_blocks to compute nodes');
      }
    }

    if (nodesError || edgesError) {
      console.error('[ComputeExecute] Error fetching graph:', nodesError || edgesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch compute graph' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!nodes || nodes.length === 0) {
      return new Response(JSON.stringify({ error: 'No nodes to execute' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create service role client for updates
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create execution run
    const { data: run, error: runError } = await serviceClient
      .from('compute_runs')
      .insert({
        project_id: projectId,
        user_id: user.id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) {
      console.error('[ComputeExecute] Error creating run:', runError);
      return new Response(JSON.stringify({ error: 'Failed to create execution run' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const runId = run.id;
    console.log('[ComputeExecute] Created run:', runId);

    // Return SSE stream for real-time updates
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          try {
            controller.enqueue(createSSEEvent(event, data));
          } catch (e) {
            console.error('[ComputeExecute] SSE send error:', e);
          }
        };

        try {
          // Send initial metadata
          send('meta', { 
            run_id: runId, 
            project_id: projectId, 
            total_nodes: nodes.length 
          });

          // Perform topological sort
          const sortedLevels = topoSort(nodes as ComputeNode[], (edges ?? []) as ComputeEdge[]);
          const executionOrder = sortedLevels.flat().map(n => n.id);

          // Update run with execution order
          await serviceClient
            .from('compute_runs')
            .update({ execution_order: executionOrder })
            .eq('id', runId);

          // Track outputs and failed nodes
          const outputs = new Map<string, any>();
          const failedNodes = new Set<string>();
          let completedCount = 0;

          // Process each level
          for (const level of sortedLevels) {
            console.log('[ComputeExecute] Processing level with nodes:', level.map(n => n.id));

            // Process nodes in parallel within each level
            await Promise.all(level.map(async (node) => {
              // Check for failed dependencies
              if (hasFailedDependency(node.id, (edges ?? []) as ComputeEdge[], failedNodes)) {
                failedNodes.add(node.id);
                
                await updateNodeStatus(serviceClient, node.id, 'failed', {
                  error: 'Upstream dependency failed'
                });
                
                await createRunEvent(serviceClient, runId, node.id, 'skipped', {
                  message: 'Skipped due to upstream failure'
                });

                send('node_status', { 
                  node_id: node.id, 
                  status: 'skipped', 
                  error: 'Upstream dependency failed' 
                });
                return;
              }

              // Update node status to running
              await updateNodeStatus(serviceClient, node.id, 'running', { progress: 0 });
              await createRunEvent(serviceClient, runId, node.id, 'running', {
                message: `Executing ${node.label}`
              });

              send('node_status', { node_id: node.id, status: 'running' });

              try {
                const startTime = Date.now();

                // Collect inputs from upstream nodes
                const edgeInputs = collectInputs(node, (edges ?? []) as ComputeEdge[], outputs);
                
                // Also include manual inputs from node params
                const manualInputs = node.params?.inputs ?? {};
                const combinedInputs = { ...manualInputs };
                
                // Merge edge inputs, extracting values from preview objects
                for (const [key, value] of Object.entries(edgeInputs)) {
                  combinedInputs[key] = extractOutputValue(value);
                }

                const normalizedInputs = await normalizeInputValues(combinedInputs);

                console.log(`[ComputeExecute] Node ${node.id} (${node.kind}) inputs:`, 
                  JSON.stringify(normalizedInputs).substring(0, 200));

                // Execute based on node kind
                let result: any;

                switch (node.kind) {
                  case 'Text':
                  case 'Prompt':
                    result = await executeTextNode(node, normalizedInputs, send);
                    break;

                  case 'Image':
                    result = await executeImageNode(node, normalizedInputs, send);
                    break;

                  case 'Video':
                    result = await executeVideoNode(node, normalizedInputs, send);
                    break;

                  case 'Audio':
                    result = await executeAudioNode(node, normalizedInputs, send);
                    break;

                  case 'Upload':
                    // Upload nodes output their stored value
                    result = { 
                      type: 'file', 
                      url: node.params?.url ?? node.params?.value ?? null,
                      data: node.params
                    };
                    break;

                  case 'Transform':
                    // Pass through with transformation
                    const inputData = Object.values(normalizedInputs)[0] || {};
                    result = { 
                      type: 'json', 
                      data: { ...inputData, transformed: true } 
                    };
                    break;

                  case 'Combine':
                    // Combine multiple inputs
                    const allValues = Object.values(normalizedInputs);
                    const textValues = allValues.filter(v => typeof v === 'string');
                    const arrayValues = allValues.filter(v => Array.isArray(v)).flat();
                    
                    if (textValues.length > 0) {
                      result = { type: 'text', data: textValues.join('\n\n') };
                    } else if (arrayValues.length > 0) {
                      result = { type: 'array', data: arrayValues };
                    } else {
                      result = { type: 'json', data: normalizedInputs };
                    }
                    break;

                  case 'Output':
                    // Output nodes pass through
                    result = { 
                      type: 'json', 
                      data: normalizedInputs,
                      artifacts: Object.values(normalizedInputs)
                    };
                    break;

                  default:
                    console.warn(`[ComputeExecute] Unknown node kind: ${node.kind}`);
                    result = { type: 'unknown', data: normalizedInputs };
                }

                const processingTime = Date.now() - startTime;
                outputs.set(node.id, result);
                completedCount++;

                // Update node status
                await updateNodeStatus(serviceClient, node.id, 'succeeded', {
                  progress: 100,
                  preview: result
                });

                // Create run event
                await createRunEvent(serviceClient, runId, node.id, 'succeeded', {
                  progress: 100,
                  artifacts: result
                });

                // Send completion event
                send('node_status', { 
                  node_id: node.id, 
                  status: 'completed',
                  output: result,
                  processing_time_ms: processingTime
                });

                console.log(`[ComputeExecute] Node ${node.id} completed in ${processingTime}ms`);

              } catch (nodeError: any) {
                console.error(`[ComputeExecute] Node ${node.id} failed:`, nodeError);
                failedNodes.add(node.id);

                await updateNodeStatus(serviceClient, node.id, 'failed', {
                  error: nodeError.message
                });

                await createRunEvent(serviceClient, runId, node.id, 'failed', {
                  message: nodeError.message
                });

                send('node_status', { 
                  node_id: node.id, 
                  status: 'failed',
                  error: nodeError.message
                });
              }
            }));
          }

          // Finalize run
          const finalStatus = failedNodes.size > 0 ? 'completed' : 'completed';
          
          await serviceClient
            .from('compute_runs')
            .update({
              status: finalStatus,
              finished_at: new Date().toISOString()
            })
            .eq('id', runId);

          // Collect all outputs
          const allOutputs: Record<string, any> = {};
          outputs.forEach((value, nodeId) => {
            allOutputs[nodeId] = value;
          });

          send('complete', { 
            run_id: runId,
            status: finalStatus,
            outputs: allOutputs,
            completed_nodes: completedCount,
            total_nodes: nodes.length,
            failed_nodes: Array.from(failedNodes)
          });

          console.log(`[ComputeExecute] Run ${runId} completed. ${completedCount}/${nodes.length} nodes succeeded.`);

        } catch (error: any) {
          console.error('[ComputeExecute] Execution error:', error);

          await serviceClient
            .from('compute_runs')
            .update({
              status: 'failed',
              finished_at: new Date().toISOString(),
              error: error.message
            })
            .eq('id', runId);

          send('error', { 
            run_id: runId,
            error: error.message 
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: getSSEHeaders(corsHeaders)
    });

  } catch (error: any) {
    console.error('[ComputeExecute] Fatal error:', error);
    // Return generic error to client, log details server-side only
    return new Response(JSON.stringify({ error: 'An error occurred during compute execution' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ============= Helper Functions =============

async function updateNodeStatus(
  supabase: any, 
  nodeId: string, 
  status: string, 
  updates: Record<string, any> = {}
) {
  await supabase
    .from('compute_nodes')
    .update({ status, ...updates })
    .eq('id', nodeId);
}

async function createRunEvent(
  supabase: any,
  runId: string,
  nodeId: string,
  status: string,
  data: Record<string, any> = {}
) {
  await supabase
    .from('compute_run_events')
    .insert({
      run_id: runId,
      node_id: nodeId,
      status,
      ...data
    });
}

// ============= Node Execution Functions =============

async function executeTextNode(
  node: ComputeNode,
  inputs: Record<string, any>,
  send: (event: string, data: Record<string, unknown>) => void
): Promise<any> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  
  // If no API key, just return the prompt text
  if (!GROQ_API_KEY) {
    console.log('[TextNode] No GROQ_API_KEY, returning static text');
    return { 
      type: 'text', 
      data: node.params?.prompt || node.params?.text || 'Text output' 
    };
  }

  const prompt = node.params?.prompt ?? inputs.prompt ?? '';
  const systemPrompt = node.params?.systemPrompt ?? 'You are a helpful assistant.';
  const model = node.params?.model ?? 'llama-3.3-70b-versatile';
  const maxTokens = node.params?.maxTokens ?? 1024;
  const temperature = node.params?.temperature ?? 0.7;

  // Substitute input variables in prompt
  const finalPrompt = substituteVariables(prompt, inputs);

  console.log(`[TextNode] Running Groq ${model} with prompt: ${finalPrompt.substring(0, 100)}...`);

  send('node_progress', { 
    node_id: node.id, 
    progress: 10,
    message: 'Calling Groq API...'
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: finalPrompt }
      ],
      max_tokens: maxTokens,
      temperature
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TextNode] Groq API error: ${response.status}`, errorText);
    throw new Error(`Groq API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  console.log(`[TextNode] Generated ${content.length} chars`);

  return { 
    type: 'text', 
    data: content,
    model,
    tokens: data.usage
  };
}

async function executeImageNode(
  node: ComputeNode,
  inputs: Record<string, any>,
  send: (event: string, data: Record<string, unknown>) => void
): Promise<any> {
  const FAL_KEY = Deno.env.get('FAL_KEY');
  
  if (!FAL_KEY) {
    console.log('[ImageNode] No FAL_KEY configured, returning placeholder');
    return { 
      type: 'image', 
      url: node.params?.imageUrl || 'https://placehold.co/512x512/1a1a2e/purple?text=No+FAL+Key',
      data: node.params,
      error: 'FAL_KEY not configured - please add your FAL.ai API key to secrets'
    };
  }

  fal.config({ credentials: FAL_KEY });

  const rawModel = node.params?.model ?? 'flux-dev';
  const model = mapModelToFalId(rawModel);
  let prompt = node.params?.prompt ?? inputs.prompt ?? '';
  const negativePrompt = node.params?.negativePrompt ?? '';

  // Substitute input variables
  prompt = substituteVariables(prompt, inputs);

  // Check if prompt is empty
  if (!prompt || prompt.trim().length === 0) {
    console.error('[ImageNode] Empty prompt provided');
    throw new Error('Image generation requires a prompt. Please add a visual description.');
  }

  // Detect and enhance non-visual prompts (task descriptions)
  const enhancedPrompt = enhancePromptForImageGeneration(prompt);
  
  if (enhancedPrompt !== prompt) {
    console.log(`[ImageNode] Enhanced non-visual prompt: "${prompt.substring(0, 50)}..." -> "${enhancedPrompt.substring(0, 80)}..."`);
  }

  const falInputs: Record<string, any> = {
    prompt: enhancedPrompt,
    image_size: node.params?.imageSize ?? 'landscape_16_9',
    num_inference_steps: node.params?.steps ?? 28,
    guidance_scale: node.params?.guidanceScale ?? 3.5,
    num_images: node.params?.numImages ?? 1,
    ...node.params?.settings
  };

  if (negativePrompt) {
    falInputs.negative_prompt = negativePrompt;
  }

  // Add input image if provided (for img2img)
  if (inputs.image) {
    falInputs.image_url = typeof inputs.image === 'string' 
      ? inputs.image 
      : inputs.image.url ?? inputs.image;
  }

  console.log(`[ImageNode] Running ${model} with prompt: ${enhancedPrompt.substring(0, 150)}...`);

  send('node_progress', { 
    node_id: node.id, 
    progress: 10,
    message: 'Queuing image generation...'
  });

  try {
    const result = await fal.subscribe(model, {
      input: falInputs,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === 'IN_PROGRESS') {
          const logCount = update.logs?.length ?? 0;
          send('node_progress', {
            node_id: node.id,
            progress: Math.min(90, 10 + logCount * 10),
            message: 'Generating image...',
            logs: update.logs?.slice(-3)
          });
        }
      }
    });

    // Extract image URL(s) from result
    let imageUrl: string | string[];
    const resultData = result as any;
    
    console.log('[ImageNode] FAL response keys:', Object.keys(resultData));
    
    // Handle wrapped response (data.images) - FAL v2 format
    const imageData = resultData.data || resultData;
    
    console.log('[ImageNode] Image data keys:', Object.keys(imageData));
    
    if (imageData.images && Array.isArray(imageData.images) && imageData.images.length > 0) {
      imageUrl = imageData.images.length === 1 
        ? imageData.images[0].url 
        : imageData.images.map((img: any) => img.url);
    } else if (imageData.image && imageData.image.url) {
      imageUrl = imageData.image.url;
    } else if (resultData.output && typeof resultData.output === 'string') {
      imageUrl = resultData.output;
    } else {
      console.error('[ImageNode] Unexpected FAL response structure:', JSON.stringify(resultData).substring(0, 500));
      throw new Error(`Image generation returned no image. Response structure: ${Object.keys(resultData).join(', ')}`);
    }

    console.log(`[ImageNode] Generated image(s):`, Array.isArray(imageUrl) ? imageUrl.length : 1);

    return { 
      type: 'image', 
      url: Array.isArray(imageUrl) ? imageUrl[0] : imageUrl,
      urls: Array.isArray(imageUrl) ? imageUrl : [imageUrl],
      model,
      prompt: enhancedPrompt
    };

  } catch (error: any) {
    console.error('[ImageNode] FAL error details:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('No image')) {
      errorMessage = `Image generation failed - no image was returned. This usually means the prompt was rejected or the model encountered an issue. Try a more descriptive visual prompt.`;
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorMessage = 'FAL.ai authentication failed. Please verify your FAL_KEY is correct.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      errorMessage = 'FAL.ai rate limit reached. Please wait a moment and try again.';
    }
    
    throw new Error(`Image generation failed: ${errorMessage}`);
  }
}

// Helper function to detect and enhance non-visual prompts
function enhancePromptForImageGeneration(prompt: string): string {
  // Patterns that indicate a task description rather than a visual prompt
  const taskPatterns = [
    /^(create|generate|make|build|develop|write|design|produce|craft)\s+(a\s+)?(content|marketing|social|brand|campaign|strategy|plan|calendar|schedule|ideas?)/i,
    /^(determine|analyze|identify|find|discover|research|explore)\s+/i,
    /^(for|based on|using)\s+(the|a|an)?\s*(audience|customer|user|market)/i,
    /content\s+(ideas?|calendar|strategy|plan)/i,
    /marketing\s+(content|strategy|plan|ideas?)/i,
    /social\s+media\s+(content|post|strategy)/i,
  ];
  
  const isTaskPrompt = taskPatterns.some(pattern => pattern.test(prompt));
  
  if (!isTaskPrompt) {
    return prompt; // Already a visual prompt
  }
  
  // Extract key themes from the task description
  const themes = extractThemesFromTask(prompt);
  
  // Build a visual prompt from the themes
  const visualPrompt = buildVisualPromptFromThemes(themes, prompt);
  
  return visualPrompt;
}

function extractThemesFromTask(prompt: string): string[] {
  const themes: string[] = [];
  
  // Extract specific subjects
  const subjectMatches = prompt.match(/(?:for|about|featuring|showing|depicting)\s+([^,.]+)/gi);
  if (subjectMatches) {
    themes.push(...subjectMatches.map(m => m.replace(/^(for|about|featuring|showing|depicting)\s+/i, '').trim()));
  }
  
  // Extract common business/marketing terms and convert to visual concepts
  if (/coffee/i.test(prompt)) themes.push('artisan coffee shop, latte art, warm lighting');
  if (/restaurant|food/i.test(prompt)) themes.push('gourmet food presentation, fine dining');
  if (/tech|software|app/i.test(prompt)) themes.push('modern tech workspace, clean design');
  if (/fashion|clothing/i.test(prompt)) themes.push('stylish fashion photography, elegant models');
  if (/fitness|gym|health/i.test(prompt)) themes.push('athletic person working out, energetic motion');
  if (/travel|vacation/i.test(prompt)) themes.push('scenic travel destination, wanderlust adventure');
  if (/marketing|brand/i.test(prompt)) themes.push('professional business setting, modern office');
  
  return themes;
}

function buildVisualPromptFromThemes(themes: string[], originalPrompt: string): string {
  const baseElements = themes.length > 0 
    ? themes.slice(0, 3).join(', ')
    : 'professional business concept illustration';
  
  // Add style modifiers for better image generation
  const styleModifiers = [
    'high quality',
    'professional photography',
    'vibrant colors',
    'excellent composition',
    'sharp focus'
  ];
  
  const visualPrompt = `${baseElements}, ${styleModifiers.slice(0, 3).join(', ')}`;
  
  console.log(`[ImageNode] Converted task prompt to visual: "${originalPrompt.substring(0, 40)}..." -> "${visualPrompt}"`);
  
  return visualPrompt;
}

async function executeVideoNode(
  node: ComputeNode,
  inputs: Record<string, any>,
  send: (event: string, data: Record<string, unknown>) => void
): Promise<any> {
  const FAL_KEY = Deno.env.get('FAL_KEY');
  
  if (!FAL_KEY) {
    console.log('[VideoNode] No FAL_KEY, returning placeholder');
    return { 
      type: 'video', 
      url: node.params?.videoUrl || '',
      data: node.params 
    };
  }

  fal.config({ credentials: FAL_KEY });

  const rawModel = node.params?.model ?? 'kling-2-1';
  const model = mapModelToFalId(rawModel);
  const prompt = node.params?.prompt ?? inputs.prompt ?? '';

  // Substitute input variables
  const finalPrompt = substituteVariables(prompt, inputs);

  const falInputs: Record<string, any> = {
    prompt: finalPrompt,
    duration: node.params?.duration ?? '5',
    aspect_ratio: node.params?.aspectRatio ?? '16:9',
    ...node.params?.settings
  };

  // Add input image if provided (for image-to-video)
  if (inputs.image) {
    falInputs.image_url = typeof inputs.image === 'string' 
      ? inputs.image 
      : inputs.image.url ?? inputs.image;
  }

  console.log(`[VideoNode] Running ${model} with prompt: ${finalPrompt.substring(0, 100)}...`);

  send('node_progress', { 
    node_id: node.id, 
    progress: 5,
    message: 'Queuing video generation...'
  });

  try {
    const result = await fal.subscribe(model, {
      input: falInputs,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === 'IN_PROGRESS') {
          const logCount = update.logs?.length ?? 0;
          send('node_progress', {
            node_id: node.id,
            progress: Math.min(90, 5 + logCount * 5),
            message: 'Generating video...',
            logs: update.logs?.slice(-3)
          });
        }
      }
    });

    // Extract video URL from result
    let videoUrl: string;
    const resultData = result as any;
    
    if (resultData.video) {
      videoUrl = resultData.video.url;
    } else if (resultData.url) {
      videoUrl = resultData.url;
    } else {
      throw new Error('No video in FAL response');
    }

    console.log(`[VideoNode] Generated video: ${videoUrl}`);

    return { 
      type: 'video', 
      url: videoUrl,
      model,
      prompt: finalPrompt
    };

  } catch (error: any) {
    console.error('[VideoNode] FAL error:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
}

async function executeAudioNode(
  node: ComputeNode,
  inputs: Record<string, any>,
  send: (event: string, data: Record<string, unknown>) => void
): Promise<any> {
  // Audio generation - could use ElevenLabs or FAL
  const prompt = node.params?.prompt ?? inputs.prompt ?? '';
  const finalPrompt = substituteVariables(prompt, inputs);

  console.log(`[AudioNode] Would generate audio for: ${finalPrompt.substring(0, 100)}...`);

  // For now, return placeholder
  return { 
    type: 'audio', 
    url: node.params?.audioUrl || '',
    prompt: finalPrompt,
    data: node.params 
  };
}

// ============= Helper Functions for Legacy Support =============

/**
 * Map studio_blocks block_type to compute_nodes kind
 */
function mapBlockTypeToKind(blockType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'Text',
    'prompt': 'Prompt',
    'image': 'Image',
    'video': 'Video',
    'audio': 'Audio',
    'upload': 'Upload',
    'output': 'Output',
    'combine': 'Combine',
    'transform': 'Transform',
  };
  
  return typeMap[blockType?.toLowerCase()] || 'Text';
}

/**
 * Map short-form model IDs to full FAL AI identifiers
 */
function mapModelToFalId(model: string): string {
  const modelMap: Record<string, string> = {
    // Image models
    'flux-dev': 'fal-ai/flux/dev',
    'flux-schnell': 'fal-ai/flux/schnell',
    'flux-pro': 'fal-ai/flux-pro/v1.1',
    'ideogram': 'fal-ai/ideogram/v2',
    'luma-photon': 'fal-ai/luma/photon',
    'recraft': 'fal-ai/recraft-v3',
    'stable': 'fal-ai/stable-diffusion-v3-medium',
    'gemini-2.5-flash-image': 'fal-ai/flux/schnell',
    'gemini-2.5-flash-image-preview': 'fal-ai/flux/schnell',
    
    // Video models
    'kling-2-1': 'fal-ai/kling-video/v1/standard/text-to-video',
    'hailuo': 'fal-ai/minimax/video-01',
    'luma-dream': 'fal-ai/luma-dream-machine',
    'gemini-2.5-flash-video': 'fal-ai/kling-video/v1/standard/text-to-video',
  };
  
  // If already a valid FAL ID (contains '/'), return as-is
  if (model && model.includes('/')) {
    return model;
  }
  
  return modelMap[model] ?? 'fal-ai/flux/dev';
}
