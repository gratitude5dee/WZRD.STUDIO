import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecutionNode {
  id: string;
  type: string;
  label: string;
  inputs: any[];
  outputs: any[];
  params: Record<string, any>;
}

interface ExecutionEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

interface ExecutionPayload {
  projectId: string;
  nodes: ExecutionNode[];
  edges: ExecutionEdge[];
  executionOrder: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ExecutionPayload = await req.json();
    const { projectId, nodes, edges, executionOrder } = payload;

    console.log('Starting graph execution:', { 
      projectId, 
      nodeCount: nodes.length, 
      executionOrder 
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique run ID
    const runId = crypto.randomUUID();

    // Create execution run record
    const { error: runError } = await supabase
      .from('execution_runs')
      .insert({
        id: runId,
        project_id: projectId,
        status: 'running',
        total_nodes: nodes.length,
        completed_nodes: 0,
        execution_order: executionOrder,
        started_at: new Date().toISOString(),
      });

    if (runError) {
      console.error('Failed to create execution run:', runError);
      throw new Error('Failed to create execution run');
    }

    // Execute nodes in order (async, don't await)
    executeNodesInOrder(supabase, runId, nodes, edges, executionOrder);

    // Return immediately with run ID
    return new Response(
      JSON.stringify({ 
        runId, 
        status: 'queued',
        message: 'Workflow execution started'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in run-graph:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Execute nodes in topological order
 */
async function executeNodesInOrder(
  supabase: any,
  runId: string,
  nodes: ExecutionNode[],
  edges: ExecutionEdge[],
  executionOrder: string[]
) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const nodeOutputs = new Map<string, Record<string, any>>();
  let completedCount = 0;

  for (const nodeId of executionOrder) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    try {
      // Update node status to generating
      await updateNodeStatus(supabase, runId, nodeId, 'generating', 0);

      // Get input values from connected nodes
      const inputValues = getNodeInputs(nodeId, edges, nodeOutputs);

      // Execute node based on type
      const outputs = await executeNode(node, inputValues);

      // Store outputs for downstream nodes
      nodeOutputs.set(nodeId, outputs);

      // Update node status to complete
      await updateNodeStatus(supabase, runId, nodeId, 'complete', 100, outputs);

      completedCount++;

      // Update run progress
      await supabase
        .from('execution_runs')
        .update({ 
          completed_nodes: completedCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', runId);

    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);
      
      // Update node status to error
      await updateNodeStatus(
        supabase, 
        runId, 
        nodeId, 
        'error', 
        0, 
        null,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Update run status to failed
      await supabase
        .from('execution_runs')
        .update({ 
          status: 'failed',
          error_message: `Node ${node.label} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);

      return; // Stop execution on error
    }
  }

  // Mark run as completed
  await supabase
    .from('execution_runs')
    .update({ 
      status: 'completed',
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);

  console.log('Graph execution completed:', runId);
}

/**
 * Get input values for a node from connected upstream nodes
 */
function getNodeInputs(
  nodeId: string,
  edges: ExecutionEdge[],
  nodeOutputs: Map<string, Record<string, any>>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  edges
    .filter(e => e.target === nodeId)
    .forEach(edge => {
      const sourceOutputs = nodeOutputs.get(edge.source);
      if (sourceOutputs && edge.sourceHandle) {
        inputs[edge.targetHandle || 'default'] = sourceOutputs[edge.sourceHandle];
      }
    });

  return inputs;
}

/**
 * Execute a single node with actual AI model calls
 */
async function executeNode(
  node: ExecutionNode,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  console.log(`Executing node ${node.id} (${node.type}):`, { inputs, params: node.params });

  const outputs: Record<string, any> = {};
  const nodeType = node.type.toLowerCase();

  try {
    // Text generation nodes
    if (nodeType.includes('text.generate')) {
      const inputText = inputs['text-in'] || node.label || 'Generate content';
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: inputText }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();
      outputs['text-out'] = data.choices[0]?.message?.content || 'No response generated';
    }
    
    // Image generation nodes
    else if (nodeType.includes('image.generate')) {
      const prompt = inputs['text-in'] || node.label || 'A beautiful image';
      const FAL_KEY = Deno.env.get('FAL_KEY');
      
      if (!FAL_KEY) {
        throw new Error('FAL_KEY not configured');
      }

      const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_size: 'square_hd',
          num_inference_steps: 4,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const result = await response.json();
      outputs['image-out'] = {
        url: result.images?.[0]?.url || '/placeholder.svg',
        width: 1024,
        height: 1024,
        prompt,
      };
    }
    
    // Video generation nodes
    else if (nodeType.includes('video.generate')) {
      const imageUrl = inputs['image-in']?.url || '/placeholder.svg';
      const prompt = inputs['text-in'] || node.label || 'Animate this image';
      const FAL_KEY = Deno.env.get('FAL_KEY');
      
      if (!FAL_KEY) {
        throw new Error('FAL_KEY not configured');
      }

      const response = await fetch('https://queue.fal.run/fal-ai/luma-dream-machine', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Video generation failed: ${response.status}`);
      }

      const result = await response.json();
      outputs['video-out'] = {
        url: result.video?.url || '/placeholder-video.mp4',
        duration: 4,
        width: 1920,
        height: 1080,
      };
    }
    
    // Text input nodes (passthrough)
    else if (nodeType.includes('text.input')) {
      outputs['text-out'] = node.label || node.params?.value || '';
    }
    
    // Image input nodes (passthrough)
    else if (nodeType.includes('image.input')) {
      outputs['image-out'] = {
        url: node.params?.url || '/placeholder.svg',
        width: 1024,
        height: 1024,
      };
    }
    
    // Default fallback
    else {
      outputs['default'] = `Processed: ${node.label}`;
    }

    return outputs;
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    throw error;
  }
}

/**
 * Update node execution status in database
 */
async function updateNodeStatus(
  supabase: any,
  runId: string,
  nodeId: string,
  status: string,
  progress: number,
  outputs?: Record<string, any> | null,
  error?: string
) {
  const { error: updateError } = await supabase
    .from('execution_node_status')
    .upsert({
      run_id: runId,
      node_id: nodeId,
      status,
      progress,
      outputs: outputs || null,
      error: error || null,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    console.error('Failed to update node status:', updateError);
  }
}
