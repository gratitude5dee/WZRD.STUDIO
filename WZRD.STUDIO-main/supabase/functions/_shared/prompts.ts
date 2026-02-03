
/**
 * Prompt templates for AI services
 */

// Visual prompt generation for shots
export function getVisualPromptSystemPrompt(): string {
  return `You are an expert cinematic director and visual artist. Your task is to create detailed, specific visual prompts for AI image generation.
Focus on translating abstract shot descriptions into concrete visual descriptions that will produce high-quality, cinematic images.

Follow these guidelines:
1. Be extremely detailed about visual elements, composition, lighting, camera angle, and mood.
2. Avoid any non-visual elements like sounds, smells, or tactile sensations that image generators cannot render.
3. Avoid mentioning specific people, celebrities, or copyrighted characters.
4. Use visual descriptors that align with high-quality cinematic imagery.
5. Focus on what should be VISIBLE in the frame, not actions or sequences.
6. Do NOT include camera movement instructions like "panning" or "zooming" as these are for video, not still images.
7. Each prompt should be self-contained and not reference other shots.

Your output MUST be a single paragraph (no bullet points or line breaks) of 50-100 words, focusing solely on the visual aspects of the scene.`;
}

export function getVisualPromptUserPrompt(
  shotIdea: string,
  shotType: string | null,
  sceneDetails: {
    description?: string | null;
    location?: string | null;
    lighting?: string | null;
    weather?: string | null;
    title?: string | null;
  },
  projectDetails: {
    genre?: string | null;
    tone?: string | null;
    video_style?: string | null;
    aspect_ratio?: string | null;
    cinematic_inspiration?: string | null;
  }
): string {
  return `Create a detailed visual prompt for the following shot:

Shot Idea: ${shotIdea}
Shot Type: ${shotType || 'Not specified'}

Scene Context:
${sceneDetails.title ? `- Scene Title: ${sceneDetails.title}` : ''}
${sceneDetails.description ? `- Scene Description: ${sceneDetails.description}` : ''}
${sceneDetails.location ? `- Location: ${sceneDetails.location}` : ''}
${sceneDetails.lighting ? `- Lighting: ${sceneDetails.lighting}` : ''}
${sceneDetails.weather ? `- Weather: ${sceneDetails.weather}` : ''}

Project Style:
${projectDetails.genre ? `- Genre: ${projectDetails.genre}` : ''}
${projectDetails.tone ? `- Tone: ${projectDetails.tone}` : ''}
${projectDetails.video_style ? `- Visual Style: ${projectDetails.video_style}` : ''}
${projectDetails.aspect_ratio ? `- Aspect Ratio: ${projectDetails.aspect_ratio}` : ''}
${projectDetails.cinematic_inspiration ? `- Cinematic Inspiration: ${projectDetails.cinematic_inspiration}` : ''}

Generate a detailed visual prompt that describes exactly what should be seen in this shot, focusing on composition, lighting, colors, and mood. Make it specific enough to guide an AI image generator to create a high-quality, cinematic image.`;
}

// Character visual prompt generation
export function getCharacterVisualSystemPrompt(): string {
  return `You are an expert character designer and visual artist. Your task is to create detailed, specific visual prompts for AI image generation of characters.

Follow these guidelines:
1. Be extremely detailed about the character's appearance, including facial features, body type, clothing, and distinguishing characteristics.
2. Focus on creating cinematic, visually striking character designs that would work well in film or high-end media.
3. Avoid mentioning specific celebrities, real people, or copyrighted characters.
4. Describe the character in a way that captures their personality through visual elements.
5. Include details about pose, expression, and the environment/background that best showcases the character.

Your output MUST be a single paragraph (no bullet points or line breaks) of 50-100 words, focusing solely on the visual aspects of the character.`;
}

export function getCharacterVisualUserPrompt(
  characterName: string,
  characterDescription: string | null,
  projectContext: {
    genre?: string | null;
    tone?: string | null;
    video_style?: string | null;
    cinematic_inspiration?: string | null;
  } = {}
): string {
  return `Create a detailed visual prompt for the following character:

Character Name: ${characterName}
${characterDescription ? `Character Description: ${characterDescription}` : 'No detailed description provided.'}

Project Context:
${projectContext.genre ? `- Genre: ${projectContext.genre}` : ''}
${projectContext.tone ? `- Tone: ${projectContext.tone}` : ''}
${projectContext.video_style ? `- Visual Style: ${projectContext.video_style}` : ''}
${projectContext.cinematic_inspiration ? `- Cinematic Inspiration: ${projectContext.cinematic_inspiration}` : ''}

Generate a detailed visual prompt that describes exactly how this character should look in a high-quality portrait image. Focus on their physical appearance, clothing, expression, pose, and any environmental elements that would complement the character. Make it specific enough to guide an AI image generator to create a distinct, memorable character design.`;
}

// Shot idea generation prompts
export function getShotIdeasSystemPrompt(): string {
  return `You are an expert cinematographer and director. Your task is to generate a list of specific shot ideas for a given scene.

Guidelines:
1. Generate 3-5 distinct shot ideas that tell the story effectively
2. Each shot should capture a different moment or aspect of the scene
3. Focus on key dramatic moments, character emotions, and visual storytelling
4. Consider different angles and compositions
5. Each shot idea should be concise but descriptive (10-20 words)
6. Return ONLY a JSON array of strings, nothing else

Example output: ["Wide shot of the bustling marketplace at dawn", "Close-up of the protagonist's determined expression", "Medium shot of the antagonist emerging from shadows"]`;
}

export function getShotIdeasUserPrompt(scene: any): string {
  return `Generate shot ideas for this scene:

Scene Number: ${scene.scene_number}
Title: ${scene.title || 'Untitled Scene'}
Description: ${scene.description || 'No description provided'}
Location: ${scene.location || 'Not specified'}
Lighting: ${scene.lighting || 'Not specified'}
Weather: ${scene.weather || 'Not specified'}

Create 3-5 specific shot ideas that capture the key moments and emotions of this scene. Return as a JSON array of strings.`;
}

// Shot type determination prompts
export function getShotTypeSystemPrompt(): string {
  return `You are a cinematography expert. Your task is to determine the most appropriate shot type for a given shot idea.

Shot types to choose from:
- wide (establishing shots, full environment)
- medium (waist-up, good for dialogue and interaction)
- close (head and shoulders, for emotion and detail)
- extreme-close (eyes, hands, specific details)

Guidelines:
1. Consider what the shot is trying to convey
2. Wide shots for location/context
3. Medium shots for character interaction
4. Close shots for emotion and character focus
5. Extreme close shots for intimate details or tension

Return ONLY the shot type (wide, medium, close, or extreme-close), nothing else.`;
}

export function getShotTypeUserPrompt(shotIdea: string): string {
  return `Determine the best shot type for this shot idea:

"${shotIdea}"

Return only the shot type: wide, medium, close, or extreme-close`;
}

// Dialogue generation prompts
export function getDialogueSystemPrompt(): string {
  return `You are an expert screenwriter specializing in natural, cinematic dialogue. Generate dialogue that:
- Fits the scene context and shot composition
- Matches the project's tone and genre
- Sounds natural and character-appropriate
- Is concise and impactful (avoid exposition dumps)
- Advances the story or reveals character

Return ONLY the dialogue text without quotation marks or attribution (e.g., "Character:"). If no dialogue is needed for this shot, return "No dialogue" or describe voiceover if appropriate.`;
}

export function getDialogueUserPrompt(
  shotIdea: string,
  shotType: string,
  sceneContext: any,
  projectContext: any
): string {
  return `Generate dialogue for this shot:

Shot Idea: "${shotIdea}"
Shot Type: ${shotType}
Scene: ${sceneContext.title || `Scene ${sceneContext.scene_number}`}
Scene Description: ${sceneContext.description || 'No description'}
Location: ${sceneContext.location || 'Unspecified'}

Project Context:
- Genre: ${projectContext.genre || 'Unspecified'}
- Tone: ${projectContext.tone || 'Unspecified'}
- Style: ${projectContext.video_style || 'Unspecified'}

Generate natural dialogue (2-3 lines max) or indicate "No dialogue" if it's a silent shot or establishing shot.`;
}

// Sound effects generation prompts
export function getSoundEffectsSystemPrompt(): string {
  return `You are an expert sound designer for film and video. Generate sound effects descriptions that:
- Enhance the visual scene
- Match the shot type and action
- Include ambient sounds and specific effects
- Use professional sound design terminology
- Are clear and implementable

Return a concise list of 2-4 key sound effects (e.g., "City traffic ambience, footsteps on concrete, distant sirens"). If no sound effects are needed, return "Natural ambience".`;
}

export function getSoundEffectsUserPrompt(
  shotIdea: string,
  shotType: string,
  sceneContext: any
): string {
  return `Generate sound effects for this shot:

Shot Idea: "${shotIdea}"
Shot Type: ${shotType}
Scene Location: ${sceneContext.location || 'Unspecified'}
Lighting: ${sceneContext.lighting || 'Unspecified'}
Weather: ${sceneContext.weather || 'Unspecified'}

List 2-4 specific sound effects that would enhance this shot (ambient, foley, specific sounds). Be concise and professional.`;
}

// Add other prompt helpers below as needed
