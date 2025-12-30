import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

interface SaveGraphRequest {
  projectId: string;
  nodes: any[];
  edges: any[];
  viewState?: { zoom: number; center: [number, number] };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { projectId, nodes, edges, viewState }: SaveGraphRequest = await req.json();
    console.log('Saving compute graph for project:', projectId, { nodeCount: nodes?.length, edgeCount: edges?.length });

    // Validate all IDs are valid UUIDs before attempting to save
    const invalidNodeIds = (nodes || []).filter((n: any) => !isValidUuid(n.id)).map((n: any) => n.id);
    const invalidEdgeIds = (edges || []).filter((e: any) => !isValidUuid(e.id)).map((e: any) => e.id);
    const invalidEdgeRefs = (edges || []).filter((e: any) => {
      const sourceNodeId = e.source?.nodeId || e.sourceNodeId;
      const targetNodeId = e.target?.nodeId || e.targetNodeId;
      return !isValidUuid(sourceNodeId) || !isValidUuid(targetNodeId);
    }).map((e: any) => e.id);

    if (invalidNodeIds.length > 0 || invalidEdgeIds.length > 0 || invalidEdgeRefs.length > 0) {
      console.error('Invalid UUIDs detected:', { invalidNodeIds, invalidEdgeIds, invalidEdgeRefs });
      return new Response(JSON.stringify({ 
        error: 'Invalid UUID format in graph data',
        details: {
          invalidNodeIds,
          invalidEdgeIds,
          invalidEdgeRefs,
          hint: 'Please refresh the page and try again. If the issue persists, regenerate the workflow.'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project not found or access denied:', projectError);
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get existing node IDs
    const { data: existingNodes } = await supabaseClient
      .from('compute_nodes')
      .select('id')
      .eq('project_id', projectId);

    const existingNodeIds = new Set((existingNodes || []).map(n => n.id));
    const newNodeIds = new Set((nodes || []).map(n => n.id));

    // Delete nodes that are no longer in the graph
    const nodesToDelete = [...existingNodeIds].filter(id => !newNodeIds.has(id));
    if (nodesToDelete.length > 0) {
      console.log('Deleting nodes:', nodesToDelete.length);
      await supabaseClient
        .from('compute_nodes')
        .delete()
        .in('id', nodesToDelete);
    }

    // Upsert nodes
    for (const node of nodes || []) {
      const nodeData = {
        id: node.id,
        project_id: projectId,
        user_id: user.id,
        kind: node.kind,
        label: node.label || 'Untitled Node',
        version: node.version || '1.0.0',
        position: node.position || { x: 0, y: 0 },
        size: node.size || { w: 420, h: 300 },
        inputs: node.inputs || [],
        outputs: node.outputs || [],
        params: node.params || {},
        metadata: node.metadata || {},
        preview: node.preview || null,
        status: node.status || 'idle',
        progress: node.progress || 0,
        error: node.error || null,
        is_dirty: node.isDirty || false,
      };

      const { error } = await supabaseClient
        .from('compute_nodes')
        .upsert(nodeData, { onConflict: 'id' });

      if (error) {
        console.error('Error upserting node:', error);
        throw error;
      }
    }

    // Get existing edge IDs
    const { data: existingEdges } = await supabaseClient
      .from('compute_edges')
      .select('id')
      .eq('project_id', projectId);

    const existingEdgeIds = new Set((existingEdges || []).map(e => e.id));
    const newEdgeIds = new Set((edges || []).map(e => e.id));

    // Delete edges that are no longer in the graph
    const edgesToDelete = [...existingEdgeIds].filter(id => !newEdgeIds.has(id));
    if (edgesToDelete.length > 0) {
      console.log('Deleting edges:', edgesToDelete.length);
      await supabaseClient
        .from('compute_edges')
        .delete()
        .in('id', edgesToDelete);
    }

    // Upsert edges
    for (const edge of edges || []) {
      const edgeData = {
        id: edge.id,
        project_id: projectId,
        source_node_id: edge.source?.nodeId || edge.sourceNodeId,
        source_port_id: edge.source?.portId || edge.sourcePortId,
        target_node_id: edge.target?.nodeId || edge.targetNodeId,
        target_port_id: edge.target?.portId || edge.targetPortId,
        data_type: edge.dataType || 'any',
        status: edge.status || 'idle',
        metadata: edge.metadata || {},
      };

      const { error } = await supabaseClient
        .from('compute_edges')
        .upsert(edgeData, { onConflict: 'id' });

      if (error) {
        console.error('Error upserting edge:', error);
        throw error;
      }
    }

    console.log('Graph saved successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Save graph error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
