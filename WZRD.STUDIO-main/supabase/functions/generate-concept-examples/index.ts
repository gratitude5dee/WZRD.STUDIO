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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log("Generating concept examples with Groq API");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a creative storytelling assistant that generates diverse and engaging story concepts. Generate 3 unique story concepts with variety - include different genres, tones, and formats. Each concept should be compelling and distinct.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format, no additional text:
{
  "concepts": [
    {"title": "Title 1", "description": "1-2 sentence description", "type": "logline"},
    {"title": "Title 2", "description": "1-2 sentence description", "type": "storyline"},
    {"title": "Title 3", "description": "1-2 sentence description", "type": "logline"}
  ]
}`
          },
          {
            role: "user",
            content: "Generate 3 diverse story concepts. For each, provide a title and a 1-2 sentence description. Include a mix of loglines (brief, punchy concepts) and storylines (slightly more detailed narratives). Make them creative and varied in genre and tone. Respond with ONLY the JSON object."
          }
        ],
        temperature: 0.9,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data, null, 2));

    // Extract the content from Groq response
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Groq response");
    }

    // Parse the JSON from the response
    let concepts;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        concepts = JSON.parse(jsonMatch[0]);
      } else {
        concepts = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse concepts JSON:", parseError, "Content:", content);
      throw new Error("Failed to parse concepts from AI response");
    }

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
