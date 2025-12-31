
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

// Define task processing functions
const taskProcessors = {
  generate_shots: async (supabase: any, job: any) => {
    const { scene_id, project_id } = job.payload;
    console.log(`Processing generate_shots for scene: ${scene_id}`);

    try {
      // Fetch scene details
      const { data: scene, error: sceneError } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', scene_id)
        .single();

      if (sceneError) throw sceneError;

      // Call Groq to generate shot ideas
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          prompt: `Generate 3-4 creative shot ideas for a scene: ${scene.description}`,
          model: 'groq/llama3-8b-8192',
          temperature: 0.7
        }
      });

      if (error) throw error;

      // Parse and insert shots
      const shotIdeas = JSON.parse(data.text);
      const shotsToInsert = shotIdeas.map((idea: string, index: number) => ({
        scene_id,
        project_id,
        shot_number: index + 1,
        prompt_idea: idea,
        image_status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('shots')
        .insert(shotsToInsert);

      if (insertError) throw insertError;

      return { success: true, shots_created: shotsToInsert.length };
    } catch (error) {
      console.error('Error in generate_shots:', error);
      throw error;
    }
  },

  generate_visual_prompt: async (supabase: any, job: any) => {
    const { shot_id } = job.payload;
    console.log(`Processing generate_visual_prompt for shot: ${shot_id}`);

    try {
      // Fetch shot and related project details
      const { data: shot, error: shotError } = await supabase
        .from('shots')
        .select(`
          id, 
          prompt_idea, 
          scene:scenes(description, location), 
          project:projects(video_style, aspect_ratio)
        `)
        .eq('id', shot_id)
        .single();

      if (shotError) throw shotError;

      // Generate visual prompt using Groq
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          prompt: `Convert this shot idea into a detailed, cinematically rich visual prompt suitable for AI image generation. 
            Incorporate scene context: ${shot.scene.description}. 
            Style: ${shot.project.video_style}. 
            Aspect Ratio: ${shot.project.aspect_ratio}
            Original Idea: ${shot.prompt_idea}`,
          model: 'groq/llama3-8b-8192',
          temperature: 0.6
        }
      });

      if (error) throw error;

      // Update shot with visual prompt
      const { error: updateError } = await supabase
        .from('shots')
        .update({ 
          visual_prompt: data.text, 
          image_status: 'prompt_ready' 
        })
        .eq('id', shot_id);

      if (updateError) throw updateError;

      return { success: true, shot_id };
    } catch (error) {
      console.error('Error in generate_visual_prompt:', error);
      throw error;
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the request (optional, depends on your security requirements)
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch and process the next pending job
    const { data: jobs, error: jobFetchError } = await supabase
      .from('job_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (jobFetchError) {
      console.error('Job fetch error:', jobFetchError);
      return errorResponse('Failed to fetch jobs', 500);
    }

    if (!jobs || jobs.length === 0) {
      return successResponse({ message: 'No pending jobs', processed: false });
    }

    const job = jobs[0];

    // Mark job as processing
    await supabase
      .from('job_queue')
      .update({ 
        status: 'processing', 
        locked_by: 'job-worker',
        locked_until: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minute lock
      })
      .eq('id', job.id);

    // Process the job
    const processor = taskProcessors[job.task_type as keyof typeof taskProcessors];
    
    if (!processor) {
      throw new Error(`No processor found for task type: ${job.task_type}`);
    }

    const result = await processor(supabase, job);

    // Update job status
    await supabase
      .from('job_queue')
      .update({ 
        status: 'completed', 
        payload: { ...job.payload, result }
      })
      .eq('id', job.id);

    return successResponse({
      message: `Processed job: ${job.task_type}`,
      jobId: job.id,
      result
    });

  } catch (error) {
    console.error('Job processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Job processing failed';
    return errorResponse(errorMessage, 500);
  }
});
