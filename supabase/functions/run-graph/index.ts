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
 * Execute a single node
 */
async function executeNode(
  node: ExecutionNode,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  console.log(`Executing node ${node.id} (${node.type}):`, { inputs, params: node.params });

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock execution based on node type
  const outputs: Record<string, any> = {};

  switch (node.type.toLowerCase()) {
    case 'text':
    case 'text.generate':
      outputs['text-out'] = `Generated text from: ${node.label}`;
      break;

    case 'image':
    case 'image.generate':
      // For image generation, we'd call the actual API here
      outputs['image-out'] = {
        url: '/placeholder.svg',
        width: 1024,
        height: 1024,
      };
      break;

    case 'video':
    case 'video.generate':
      outputs['video-out'] = {
        url: '/placeholder-video.mp4',
        duration: 4,
        width: 1920,
        height: 1080,
      };
      break;

    default:
      outputs['default'] = `Output from ${node.label}`;
  }

  return outputs;
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
