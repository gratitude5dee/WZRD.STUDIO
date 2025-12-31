import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProjectShare(projectId: string) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareLink = useCallback(async (
    accessLevel: 'view' | 'comment' | 'edit',
    expiresIn: string
  ) => {
    setIsGenerating(true);

    try {
      const token = crypto.randomUUID();
      let expiresAt: Date | null = null;

      if (expiresIn !== 'never') {
        const now = new Date();
        switch (expiresIn) {
          case '1h':
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
            break;
          case '24h':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case '7d':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            expiresAt = null;
        }
      }

      const { error } = await (supabase
        .from('project_share_links' as any)
        .insert({
          project_id: projectId,
          token,
          access_level: accessLevel,
          expires_at: expiresAt?.toISOString(),
        }) as any);

      if (error) throw error;

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/share/${token}`;

      setShareLink(link);
      return link;
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [projectId]);

  const updateProjectVisibility = useCallback(async (isPrivate: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_private: isPrivate } as any)
        .eq('id', projectId);

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent('project-visibility-updated', {
          detail: { projectId, isPrivate },
        })
      );

      toast.success(`Project is now ${isPrivate ? 'private' : 'public'}`);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  }, [projectId]);

  return {
    shareLink,
    isGenerating,
    generateShareLink,
    updateProjectVisibility,
  };
}
