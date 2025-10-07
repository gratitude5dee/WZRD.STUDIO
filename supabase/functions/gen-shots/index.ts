import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const encoder = new TextEncoder();

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  let body: { projectId?: string; sceneId?: string; existingShots?: Array<{ id: string; shot_number: number }> };
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  if (!body.projectId) {
    return new Response(JSON.stringify({ error: "projectId is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const streamStart = performance.now();
      const shotId = crypto.randomUUID();
      const targetScene = body.sceneId ?? "scene-virtual";
      const nextNumber = (body.existingShots?.reduce((max, item) => Math.max(max, item.shot_number), 0) ?? 0) + 1;

      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("meta", {
        requestId: crypto.randomUUID(),
        projectId: body.projectId,
        sceneId: targetScene,
        latency: Math.round(performance.now() - streamStart)
      });

      const phases: Array<{ status: "creating" | "drafting" | "enriching" | "ready"; delay: number; payload: Record<string, unknown> }> = [
        {
          status: "creating",
          delay: 120,
          payload: {
            title: "Placeholder Shot",
            description: "Spinning up shot outline"
          }
        },
        {
          status: "drafting",
          delay: 220,
          payload: {
            title: "Drafting beat",
            description: "Sketching key actions",
            visual_prompt: "Wide shot – establishing the scene"
          }
        },
        {
          status: "enriching",
          delay: 240,
          payload: {
            title: "Enriching details",
            description: "Adding style and pacing",
            thumbnail: null
          }
        },
        {
          status: "ready",
          delay: 260,
          payload: {
            title: "Cinematic beat",
            description: "Hero glances toward neon skyline",
            visual_prompt: "Moody cyberpunk alley, volumetric light",
            thumbnail: null
          }
        }
      ];

      for (const phase of phases) {
        await wait(phase.delay);
        send("shot", {
          id: shotId,
          project_id: body.projectId,
          scene_id: targetScene,
          shot_number: nextNumber,
          status: phase.status,
          ...phase.payload
        });
      }

      send("done", { completed: true, duration: Math.round(performance.now() - streamStart) });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
      "Server-Timing": `bootstrap;dur=${Math.round(performance.now() - startTime)}`
    }
  });
});
