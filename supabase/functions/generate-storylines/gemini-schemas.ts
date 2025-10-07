/**
 * JSON Schemas for Gemini Structured Output
 * FLATTENED to reduce nesting depth to max 4 levels (Gemini limit is 5)
 * All nested schemas are inlined to avoid exceeding nesting limits
 */

export const STORYLINE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    primary_storyline: {
      type: "object",
      properties: {
        title: { type: "string", description: "Compelling storyline title" },
        description: { type: "string", description: "One-paragraph summary" },
        tags: { type: "array", items: { type: "string" }, description: "3-10 relevant keywords" },
        full_story: { type: "string", description: "Comprehensive story outline (3-5 paragraphs)" },
        visual_style_notes: { type: "string", description: "Visual style for AI image generation" },
        cinematography_notes: { type: "string", description: "Camera techniques and movement patterns" }
      },
      required: ["title", "description", "tags", "full_story"]
    },
    scene_breakdown: {
      type: "array",
      description: "Scene-by-scene breakdown with shot ideas",
      items: {
        type: "object",
        properties: {
          scene_number: { type: "integer", description: "Sequential scene number" },
          title: { type: "string", description: "Scene title" },
          description: { type: "string", description: "Detailed scene description" },
          location: { type: "string", description: "Location or setting" },
          lighting: { type: "string", description: "Lighting style (e.g., natural, golden_hour, dramatic)" },
          weather: { type: "string", description: "Weather conditions (e.g., clear, rainy, foggy)" },
          emotional_tone: { type: "string", description: "Emotional feeling (e.g., tense, joyful)" },
          color_palette: { type: "string", description: "Color grading suggestions" },
          shot_ideas: {
            type: "array",
            description: "Key shots for this scene (REQUIRED: 3-6 shots) - YOU MUST PROVIDE AT LEAST 3 SHOTS FOR EVERY SCENE",
            minItems: 3,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                shot_type: { type: "string", description: "Shot type (e.g., wide, close_up, pov)" },
                description: { type: "string", description: "Narrative description of the shot" },
                visual_prompt: { type: "string", description: "AI image generation prompt (60-300 chars)" },
                camera_movement: { type: "string", description: "Camera movement (e.g., static, pan, tracking)" },
                duration_seconds: { type: "number", description: "Shot duration in seconds (1-15)" },
                composition_notes: { type: "string", description: "Framing and composition notes" }
              },
              required: ["shot_type", "description", "visual_prompt", "camera_movement", "duration_seconds"]
            }
          }
        },
        required: ["scene_number", "title", "description", "location", "shot_ideas"]
      }
    }
  },
  required: ["primary_storyline", "scene_breakdown"]
};

export const ALTERNATIVE_STORYLINE_SCHEMA = {
  type: "object",
  properties: {
    primary_storyline: {
      type: "object",
      properties: {
        title: { type: "string", description: "Compelling storyline title" },
        description: { type: "string", description: "One-paragraph summary" },
        tags: { type: "array", items: { type: "string" }, description: "3-10 relevant keywords" },
        full_story: { type: "string", description: "Comprehensive story outline (3-5 paragraphs)" },
        visual_style_notes: { type: "string", description: "Visual style for AI image generation" },
        cinematography_notes: { type: "string", description: "Camera techniques and movement patterns" }
      },
      required: ["title", "description", "tags", "full_story"]
    }
  },
  required: ["primary_storyline"]
};

export const ANALYSIS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    potential_genre: { type: "string", description: "Inferred genre from the story" },
    potential_tone: { type: "string", description: "Inferred tone from the story" },
    characters: {
      type: "array",
      description: "Main characters identified in the story",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        },
        required: ["name", "description"]
      }
    },
    settings: {
      type: "object",
      properties: {
        locations: { type: "array", items: { type: "string" }, description: "Key locations" },
        time_period: { type: "string", description: "When the story takes place" },
        weather_conditions: { type: "array", items: { type: "string" }, description: "Weather conditions" }
      }
    }
  }
};
