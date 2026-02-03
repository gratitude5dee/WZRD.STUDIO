
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface ApiKeys {
  lumaApiKey: string | null;
  claudeApiKey: string | null;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchApiKeys = async () => {
    if (!user) {
      setApiKeys(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      // Use the new edge function to get application-level API keys
      const { data, error } = await supabase.functions.invoke('get-application-keys', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setApiKeys({
        lumaApiKey: data.luma_api_key,
        claudeApiKey: data.claude_api_key
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  return {
    apiKeys,
    isLoading,
    refreshApiKeys: fetchApiKeys
  };
};
