/**
 * JSON Schemas for Gemini Structured Output
 * These schemas enforce exact output structure from Gemini models
 */

export const SHOT_IDEA_SCHEMA = {
  type: "object",
  properties: {
    shot_type: {
      type: "string",
      enum: [
        "extreme_wide",
        "wide",
        "medium",
        "close_up",
        "extreme_close_up",
        "over_shoulder",
        "pov",
        "aerial",
        "tracking"
      ],
      description: "The type of camera shot"
    },
    description: {
      type: "string",
      maxLength: 150,
      description: "Narrative description of the shot for the storyboard team"
    },
    visual_prompt: {
      type: "string",
      minLength: 60,
      maxLength: 300,
      description: "Optimized prompt for AI image generation (Flux, DALL-E, Midjourney syntax)"
    },
    camera_movement: {
      type: "string",
      enum: ["static", "pan", "tilt", "dolly", "tracking", "handheld", "crane", "zoom", "steadicam"],
      description: "Camera movement type"
    },
    duration_seconds: {
      type: "number",
      minimum: 1,
      maximum: 15,
      description: "Suggested shot duration in seconds"
    },
    composition_notes: {
      type: "string",
      maxLength: 200,
      description: "Notes on framing, rule of thirds, leading lines, etc."
    }
  },
  required: ["shot_type", "description", "visual_prompt", "camera_movement", "duration_seconds"]
};

export const SCENE_SCHEMA = {
  type: "object",
  properties: {
    scene_number: {
      type: "integer",
      minimum: 1,
      description: "Sequential scene number"
    },
    title: {
      type: "string",
      maxLength: 100,
      description: "Scene title"
    },
    description: {
      type: "string",
      minLength: 50,
      maxLength: 500,
      description: "Detailed scene description"
    },
    location: {
      type: "string",
      maxLength: 100,
      description: "Specific location or setting"
    },
    lighting: {
      type: "string",
      enum: [
        "natural",
        "golden_hour",
        "blue_hour",
        "night",
        "studio",
        "dramatic",
        "soft",
        "harsh",
        "rim_lighting",
        "backlit",
        "three_point"
      ],
      description: "Lighting condition or style"
    },
    weather: {
      type: "string",
      enum: ["clear", "cloudy", "rainy", "stormy", "foggy", "snowy", "sunset", "dawn", "overcast"],
      description: "Weather conditions"
    },
    emotional_tone: {
      type: "string",
      maxLength: 50,
      description: "The emotional feeling of the scene (e.g., tense, joyful, melancholic)"
    },
    color_palette: {
      type: "string",
      maxLength: 100,
      description: "Color grading or palette suggestions (e.g., 'teal and orange', 'muted pastels', 'high contrast noir')"
    },
    shot_ideas: {
      type: "array",
      items: SHOT_IDEA_SCHEMA,
      minItems: 2,
      maxItems: 8,
      description: "Key shots for this scene"
    }
  },
  required: ["scene_number", "title", "description", "shot_ideas"]
};

export const PRIMARY_STORYLINE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      maxLength: 100,
      description: "Compelling storyline title"
    },
    description: {
      type: "string",
      maxLength: 200,
      description: "One-paragraph summary"
    },
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 10,
      description: "Relevant keywords for categorization"
    },
    full_story: {
      type: "string",
      minLength: 300,
      description: "Comprehensive story outline (3-5 paragraphs)"
    },
    visual_style_notes: {
      type: "string",
      maxLength: 300,
      description: "Overall visual style direction for image generation (cinematography style, art direction, mood)"
    },
    cinematography_notes: {
      type: "string",
      maxLength: 300,
      description: "Camera techniques, lens choices, movement patterns, and visual motifs to be used throughout"
    }
  },
  required: ["title", "description", "tags", "full_story", "visual_style_notes"]
};

export const STORYLINE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    primary_storyline: PRIMARY_STORYLINE_SCHEMA,
    scene_breakdown: {
      type: "array",
      items: SCENE_SCHEMA,
      minItems: 3,
      maxItems: 12,
      description: "Scene-by-scene breakdown with shot ideas"
    }
  },
  required: ["primary_storyline", "scene_breakdown"]
};

export const ALTERNATIVE_STORYLINE_SCHEMA = {
  type: "object",
  properties: {
    primary_storyline: PRIMARY_STORYLINE_SCHEMA
  },
  required: ["primary_storyline"]
};

export const ANALYSIS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    potential_genre: {
      type: "string",
      description: "Inferred genre from the story"
    },
    potential_tone: {
      type: "string",
      description: "Inferred tone from the story"
    },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", maxLength: 200 }
        },
        required: ["name", "description"]
      },
      maxItems: 8,
      description: "Main characters identified in the story"
    },
    settings: {
      type: "object",
      properties: {
        locations: {
          type: "array",
          items: { type: "string" },
          description: "Key locations mentioned"
        },
        time_period: {
          type: "string",
          description: "When the story takes place"
        },
        weather_conditions: {
          type: "array",
          items: { type: "string" },
          description: "Weather mentioned in the story"
        }
      }
    }
  }
};
