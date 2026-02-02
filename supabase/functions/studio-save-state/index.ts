import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/response.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { projectId, blocks, canvasState } = await req.json();

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log(`Saving state for project ${projectId}:`, {
      blockCount: blocks?.length,
      hasCanvasState: !!canvasState
    });

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found or access denied');
    }

    // Start a transaction by saving blocks
    if (blocks && Array.isArray(blocks)) {
      const { data: existingBlocks, error: existingError } = await supabase
        .from('studio_blocks')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (existingError) {
        console.error('Error loading existing blocks:', existingError);
        throw existingError;
      }

      const incomingIds = new Set(blocks.map((block: any) => block.id).filter(Boolean));
      const existingIds = (existingBlocks || []).map((block: any) => block.id);
      const idsToDelete = existingIds.filter((id: string) => !incomingIds.has(id));

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('studio_blocks')
          .delete()
          .in('id', idsToDelete)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting blocks:', deleteError);
          throw deleteError;
        }
      }

      if (blocks.length > 0) {
        const blocksToUpsert = blocks.map((block: any) => ({
          id: block.id,
          project_id: projectId,
          user_id: user.id,
          block_type: (block.type || 'text').toLowerCase(), // Normalize to lowercase
          position_x: block.position.x,
          position_y: block.position.y,
          prompt: block.initialData?.prompt || null,
          generated_output_url: block.initialData?.imageUrl || null,
          generation_metadata: {
            generationTime: block.initialData?.generationTime,
            aspectRatio: block.initialData?.aspectRatio
          },
          selected_model: block.selectedModel || null
        }));

        const { error: upsertError } = await supabase
          .from('studio_blocks')
          .upsert(blocksToUpsert, { onConflict: 'id' });

        if (upsertError) {
          console.error('Error upserting blocks:', upsertError);
          throw upsertError;
        }
      }
    }

    // Save canvas state
    if (canvasState) {
      const { error: canvasError } = await supabase
        .from('canvas_state')
        .upsert({
          project_id: projectId,
          user_id: user.id,
          viewport_data: canvasState.viewport || { x: 0, y: 0, zoom: 1 },
          canvas_settings: canvasState.settings || { showGrid: true }
        }, {
          onConflict: 'project_id'
        });

      if (canvasError) {
        console.error('Error saving canvas state:', canvasError);
        throw canvasError;
      }
    }

    console.log(`Successfully saved state for project ${projectId}`);

    return new Response(
      JSON.stringify({ success: true, savedBlocks: blocks?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in studio-save-state:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save state';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});