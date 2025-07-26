import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface SynthesisRequest {
  concepts: string[];
  mode: 'explore' | 'connect' | 'create';
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    const user = await authenticateRequest(req.headers);
    const { concepts, mode, context }: SynthesisRequest = await req.json();
    
    if (!concepts || concepts.length < 2) {
      return errorResponse('At least 2 concepts are required for synthesis', 400);
    }

    console.log(`[AI Synthesis] Processing ${concepts.length} concepts in ${mode} mode`);

    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      return errorResponse('Server config error: Anthropic key missing', 500);
    }

    // Create synthesis prompt based on mode
    let systemPrompt = '';
    let userPrompt = '';

    switch (mode) {
      case 'explore':
        systemPrompt = `You are a cosmic knowledge synthesizer. Your role is to explore deep connections between concepts and reveal hidden patterns. Think like a scientist discovering universal principles.`;
        userPrompt = `Explore the deep connections between these concepts: ${concepts.join(', ')}. 
        ${context ? `Context: ${context}` : ''}
        
        Provide a profound insight that reveals:
        1. Hidden patterns or relationships
        2. Emergent properties when these concepts combine
        3. New perspectives or paradigms
        
        Format as a single, impactful insight (2-3 sentences max).`;
        break;

      case 'connect':
        systemPrompt = `You are a master pattern recognizer specializing in bridging knowledge domains. You excel at finding unexpected connections that spark innovation.`;
        userPrompt = `Find innovative connections between: ${concepts.join(', ')}.
        ${context ? `Context: ${context}` : ''}
        
        Generate a connection that:
        1. Links seemingly unrelated concepts
        2. Suggests practical applications
        3. Opens new avenues for exploration
        
        Express as an actionable insight (2-3 sentences max).`;
        break;

      case 'create':
        systemPrompt = `You are a creative synthesis engine that generates novel ideas by combining existing concepts in unexpected ways. Think like an inventor and visionary.`;
        userPrompt = `Create something new by synthesizing: ${concepts.join(', ')}.
        ${context ? `Context: ${context}` : ''}
        
        Generate a creative synthesis that:
        1. Combines concepts in a novel way
        2. Suggests new possibilities or solutions
        3. Has practical or theoretical value
        
        Present as an innovative concept or solution (2-3 sentences max).`;
        break;
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.8,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      throw new Error(error.error?.message || 'Failed to generate synthesis');
    }

    const data = await response.json();
    const insight = data.content[0].text.trim();

    console.log(`[AI Synthesis] Generated insight: ${insight.substring(0, 100)}...`);

    return successResponse({
      insight,
      concepts,
      mode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Synthesis] Error:', error);
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
});