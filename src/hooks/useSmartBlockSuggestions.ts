import { useMemo } from 'react';

export interface BlockSuggestion {
  type: 'text' | 'image' | 'video';
  confidence: number;
  reason: string;
}

interface UseSmartBlockSuggestionsProps {
  sourceBlockType?: 'text' | 'image' | 'video';
  sourceBlockContent?: string;
  connectionType?: 'output' | 'input';
}

export const useSmartBlockSuggestions = ({
  sourceBlockType,
  sourceBlockContent,
  connectionType = 'output',
}: UseSmartBlockSuggestionsProps) => {
  const suggestions = useMemo(() => {
    const results: BlockSuggestion[] = [];

    if (!sourceBlockType) {
      // No context - suggest all types equally
      return [
        { type: 'text' as const, confidence: 0.33, reason: 'Generate text content' },
        { type: 'image' as const, confidence: 0.33, reason: 'Create visual content' },
        { type: 'video' as const, confidence: 0.33, reason: 'Generate video' },
      ];
    }

    // Smart suggestions based on source block type
    if (sourceBlockType === 'text') {
      if (connectionType === 'output') {
        results.push(
          { type: 'image', confidence: 0.5, reason: 'Visualize text as image' },
          { type: 'text', confidence: 0.3, reason: 'Transform or summarize' },
          { type: 'video', confidence: 0.2, reason: 'Create video from concept' }
        );
      } else {
        results.push(
          { type: 'text', confidence: 0.6, reason: 'Process with more text' },
          { type: 'image', confidence: 0.4, reason: 'Describe or caption image' }
        );
      }
    } else if (sourceBlockType === 'image') {
      if (connectionType === 'output') {
        results.push(
          { type: 'text', confidence: 0.5, reason: 'Describe or analyze image' },
          { type: 'video', confidence: 0.35, reason: 'Animate the image' },
          { type: 'image', confidence: 0.15, reason: 'Create variation' }
        );
      } else {
        results.push(
          { type: 'text', confidence: 0.7, reason: 'Add prompt or description' },
          { type: 'image', confidence: 0.3, reason: 'Combine images' }
        );
      }
    } else if (sourceBlockType === 'video') {
      if (connectionType === 'output') {
        results.push(
          { type: 'text', confidence: 0.6, reason: 'Transcribe or describe' },
          { type: 'image', confidence: 0.3, reason: 'Extract key frames' },
          { type: 'video', confidence: 0.1, reason: 'Transform video' }
        );
      }
    }

    // Analyze content for additional context
    if (sourceBlockContent) {
      const lowerContent = sourceBlockContent.toLowerCase();
      
      // Keywords that suggest image generation
      const imageKeywords = ['image', 'picture', 'photo', 'visual', 'draw', 'paint', 'scene', 'landscape'];
      if (imageKeywords.some(kw => lowerContent.includes(kw))) {
        const imageIdx = results.findIndex(r => r.type === 'image');
        if (imageIdx >= 0) results[imageIdx].confidence += 0.15;
      }
      
      // Keywords that suggest video generation
      const videoKeywords = ['video', 'animation', 'motion', 'animate', 'movie', 'clip'];
      if (videoKeywords.some(kw => lowerContent.includes(kw))) {
        const videoIdx = results.findIndex(r => r.type === 'video');
        if (videoIdx >= 0) results[videoIdx].confidence += 0.15;
      }
    }

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  }, [sourceBlockType, sourceBlockContent, connectionType]);

  return suggestions;
};
