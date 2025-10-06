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
      // Delete existing blocks for this project
      const { error: deleteError } = await supabase
        .from('studio_blocks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting blocks:', deleteError);
        throw deleteError;
      }

      // Insert new blocks
      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block: any) => ({
          project_id: projectId,
          user_id: user.id,
          block_type: block.type,
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

        const { error: insertError } = await supabase
          .from('studio_blocks')
          .insert(blocksToInsert);

        if (insertError) {
          console.error('Error inserting blocks:', insertError);
          throw insertError;
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});