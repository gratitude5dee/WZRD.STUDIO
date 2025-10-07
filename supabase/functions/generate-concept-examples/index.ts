import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating concept examples with Gemini 2.5 Flash");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a creative storytelling assistant that generates diverse and engaging story concepts. Generate 3 unique story concepts with variety - include different genres, tones, and formats. Each concept should be compelling and distinct."
          },
          {
            role: "user",
            content: "Generate 3 diverse story concepts. For each, provide a title and a 1-2 sentence description. Include a mix of loglines (brief, punchy concepts) and storylines (slightly more detailed narratives). Make them creative and varied in genre and tone."
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_concepts",
              description: "Generate 3 diverse story concepts with titles and descriptions",
              parameters: {
                type: "object",
                properties: {
                  concepts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "A catchy, memorable title for the story concept"
                        },
                        description: {
                          type: "string",
                          description: "A 1-2 sentence description of the story concept"
                        },
                        type: {
                          type: "string",
                          enum: ["logline", "storyline"],
                          description: "Whether this is a brief logline or a more detailed storyline"
                        }
                      },
                      required: ["title", "description", "type"]
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["concepts"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_concepts" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== "generate_concepts") {
      throw new Error("Invalid response format from AI");
    }

    const concepts = JSON.parse(toolCall.function.arguments);
    console.log("Generated concepts:", concepts);

    return new Response(
      JSON.stringify(concepts),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-concept-examples:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate concepts" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
