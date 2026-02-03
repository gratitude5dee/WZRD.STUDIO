
/**
 * Helper functions for interacting with Claude API
 */

export async function callClaudeApi(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Claude API error:', error);
    throw new Error(error.error?.message || 'Failed to generate text with Claude');
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Safely parse JSON from a text string with improved robustness
 */
export function safeParseJson<T>(text: string): T | null {
  if (!text) return null;
  
  try {
    // First attempt: direct JSON parsing
    return JSON.parse(text);
  } catch (directError) {
    console.error('Failed to parse JSON directly:', directError instanceof Error ? directError.message : String(directError));
    
    try {
      // Second attempt: try to clean markdown formatting
      const cleanedText = text.replace(/```json\s+/g, '').replace(/```\s*$/g, '');
      return JSON.parse(cleanedText);
    } catch (markdownError) {
      console.error('Failed to parse JSON after cleaning markdown:', markdownError instanceof Error ? markdownError.message : String(markdownError));
      
      try {
        // Third attempt: Try to extract JSON from a text block
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (extractError) {
        console.error('Failed to extract and parse JSON:', extractError instanceof Error ? extractError.message : String(extractError));
      }

      console.error('Original content being parsed:', text);
      return null;
    }
  }
}
