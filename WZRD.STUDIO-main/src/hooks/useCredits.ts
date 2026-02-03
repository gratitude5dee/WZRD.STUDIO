import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

export interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: 'usage' | 'purchase' | 'refund' | 'free';
  resource_type: 'image' | 'video' | 'text' | 'credit';
  created_at: string;
  metadata: Record<string, any>;
}

export const useCredits = () => {
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const { user } = useAuth();

  // Fetch available credits
  const fetchCredits = async () => {
    if (!user) {
      setAvailableCredits(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_available_credits');
      
      if (error) throw error;
      
      setAvailableCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Failed to load credits');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credit transactions - Using RPC to bypass type issues
  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      // For now, we'll just set empty transactions since we can't access the table directly
      // This should be replaced with a proper RPC call or edge function
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Use credits for a resource
  const useCreditsForResource = async (resourceType: 'image' | 'video' | 'text', creditCost: number = 1, metadata: Record<string, any> = {}) => {
    if (!user) {
      toast.error('Please log in to use this feature');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('use_credits', {
        resource_type: resourceType,
        credit_cost: creditCost,
        metadata
      });
      
      if (error) throw error;
      
      if (!data) {
        toast.error('Not enough credits available');
        return false;
      }

      // Refresh credits after usage
      fetchCredits();
      fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      toast.error('Failed to use credits');
      return false;
    }
  };

  // Add credits to user account
  const addCredits = async (amount: number, transactionType: 'purchase' | 'free' = 'purchase', metadata: Record<string, any> = {}) => {
    if (!user) {
      toast.error('Please log in to add credits');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('add_credits', {
        credit_amount: amount,
        transaction_type: transactionType,
        metadata
      });
      
      if (error) throw error;
      
      // Refresh credits after addition
      fetchCredits();
      fetchTransactions();
      toast.success(`Added ${amount} credits to your account`);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
      return false;
    }
  };

  // Initialize
  useEffect(() => {
    fetchCredits();
    fetchTransactions();
  }, [user]);

  return {
    availableCredits,
    isLoading,
    transactions,
    useCredits: useCreditsForResource,
    addCredits,
    refreshCredits: fetchCredits,
    refreshTransactions: fetchTransactions
  };
};