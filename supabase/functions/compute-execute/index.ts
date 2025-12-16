import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteRequest {
  projectId: string;
  nodeIds?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { projectId, nodeIds }: ExecuteRequest = await req.json();
    console.log('Executing compute graph for project:', projectId);

    // Fetch all nodes and edges for the project
    const { data: nodes, error: nodesError } = await supabaseClient
      .from('compute_nodes')
      .select('*')
      .eq('project_id', projectId);

    const { data: edges, error: edgesError } = await supabaseClient
      .from('compute_edges')
      .select('*')
      .eq('project_id', projectId);

    if (nodesError || edgesError) {
      console.error('Error fetching graph:', nodesError || edgesError);
      throw new Error('Failed to fetch compute graph');
    }

    if (!nodes || nodes.length === 0) {
      return new Response(JSON.stringify({ error: 'No nodes to execute' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build execution order using topological sort
    const executionOrder = topologicalSort(nodes, edges || []);
    console.log('Execution order:', executionOrder);

    // Create a new run
    const { data: run, error: runError } = await supabaseClient
      .from('compute_runs')
      .insert({
        project_id: projectId,
        user_id: user.id,
        status: 'running',
        execution_order: executionOrder,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating run:', runError);
      throw runError;
    }

    console.log('Created run:', run.id);

    // Execute nodes in order
    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      console.log(`Executing node: ${node.label} (${node.kind})`);

      // Update node status to running
      await supabaseClient
        .from('compute_nodes')
        .update({ status: 'running', progress: 0 })
        .eq('id', nodeId);

      // Create run event
      await supabaseClient
        .from('compute_run_events')
        .insert({
          run_id: run.id,
          node_id: nodeId,
          status: 'running',
          progress: 0,
          message: `Executing ${node.label}`
        });

      try {
        // Execute node based on kind
        const result = await executeNode(node, nodes, edges || [], supabaseClient);
        
        await supabaseClient
          .from('compute_nodes')
          .update({ 
            status: 'succeeded', 
            progress: 100,
            preview: result.preview 
          })
          .eq('id', nodeId);

        await supabaseClient
          .from('compute_run_events')
          .insert({
            run_id: run.id,
            node_id: nodeId,
            status: 'succeeded',
            progress: 100,
            artifacts: result.artifacts || []
          });

        console.log(`Node ${node.label} completed successfully`);
      } catch (nodeError: any) {
        console.error(`Node ${node.label} failed:`, nodeError);
        
        await supabaseClient
          .from('compute_nodes')
          .update({ status: 'failed', error: nodeError.message })
          .eq('id', nodeId);

        await supabaseClient
          .from('compute_run_events')
          .insert({
            run_id: run.id,
            node_id: nodeId,
            status: 'failed',
            message: nodeError.message
          });
      }
    }

    // Complete the run
    await supabaseClient
      .from('compute_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString()
      })
      .eq('id', run.id);

    console.log('Run completed:', run.id);

    return new Response(JSON.stringify({ runId: run.id, status: 'completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Execute error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function topologicalSort(nodes: any[], edges: any[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build adjacency list
  edges.forEach(edge => {
    graph.get(edge.source_node_id)?.push(edge.target_node_id);
    inDegree.set(edge.target_node_id, (inDegree.get(edge.target_node_id) || 0) + 1);
  });

  // Find nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    graph.get(nodeId)?.forEach(targetId => {
      const newDegree = (inDegree.get(targetId) || 1) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) queue.push(targetId);
    });
  }

  return result;
}

async function executeNode(node: any, allNodes: any[], edges: any[], supabase: any) {
  // Get input values from connected nodes
  const inputEdges = edges.filter((e: any) => e.target_node_id === node.id);
  const inputs: Record<string, any> = {};
  
  for (const edge of inputEdges) {
    const sourceNode = allNodes.find((n: any) => n.id === edge.source_node_id);
    if (sourceNode?.preview) {
      inputs[edge.target_port_id] = sourceNode.preview;
    }
  }

  // Execute based on node kind
  switch (node.kind) {
    case 'Image':
      // TODO: Call FAL.ai or other image generation API
      return { 
        preview: { 
          type: 'image', 
          url: node.params?.imageUrl || 'https://placehold.co/512x512/1a1a2e/purple?text=Generated',
          data: node.params 
        }, 
        artifacts: [] 
      };
    
    case 'Text':
      return { 
        preview: { 
          type: 'text', 
          data: node.params?.text || node.params?.prompt || 'Text output' 
        }, 
        artifacts: [] 
      };
    
    case 'Video':
      // TODO: Call video generation API
      return { 
        preview: { 
          type: 'video', 
          url: node.params?.videoUrl || '',
          data: node.params 
        }, 
        artifacts: [] 
      };
    
    case 'Prompt':
      return { 
        preview: { 
          type: 'text', 
          data: node.params?.prompt || '' 
        }, 
        artifacts: [] 
      };
    
    case 'Transform':
      // Pass through with transformation
      const inputData = Object.values(inputs)[0] || {};
      return { 
        preview: { 
          type: 'json', 
          data: { ...inputData, transformed: true } 
        }, 
        artifacts: [] 
      };
    
    case 'Output':
      // Collect all inputs as outputs
      return { 
        preview: { 
          type: 'json', 
          data: inputs 
        }, 
        artifacts: Object.values(inputs) 
      };
    
    default:
      return { preview: null, artifacts: [] };
  }
}
