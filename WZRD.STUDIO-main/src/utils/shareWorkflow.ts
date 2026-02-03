
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareWorkflowParams {
  workflowId: string;
  title: string;
  description?: string;
}

export async function shareWorkflow({ workflowId, title, description }: ShareWorkflowParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('You must be logged in to share workflows')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          workflowId,
          title,
          description,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to share workflow')
    }

    const { shareId } = await response.json()
    return shareId

  } catch (error) {
    console.error('Share workflow failed:', error)
    throw error
  }
}
