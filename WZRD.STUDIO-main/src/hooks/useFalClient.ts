
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "@/providers/AuthProvider";

export const useFalClient = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeFalClient = async () => {
      try {
        if (!user) {
          setIsError(true);
          return;
        }

        // Simply check if we have an authenticated user
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize fal.ai client:', err);
        setIsError(true);
      }
    };

    initializeFalClient();
  }, [toast, user]);

  return { isInitialized, isError };
};
