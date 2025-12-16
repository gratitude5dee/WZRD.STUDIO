import { useState, useCallback } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface WalletAuthResult {
  session: Session;
  user: User;
}

interface UseWalletAuthReturn {
  authenticateWallet: () => Promise<WalletAuthResult | null>;
  isAuthenticating: boolean;
  error: string | null;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  const authenticateWallet = useCallback(async (): Promise<WalletAuthResult | null> => {
    if (!account?.address) {
      setError('No wallet connected');
      return null;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with WZRD Studio.\n\nWallet: ${account.address}\nTimestamp: ${timestamp}\n\nThis signature proves you own this wallet and does not authorize any transactions.`;

      // Sign the message using Thirdweb
      let signature: string;
      try {
        signature = await account.signMessage({ message });
      } catch (signError: any) {
        if (signError.message?.includes('rejected') || signError.message?.includes('denied')) {
          setError('Signature request was rejected');
          return null;
        }
        throw signError;
      }

      // Call the wallet-auth edge function
      const { data, error: fnError } = await supabase.functions.invoke('wallet-auth', {
        body: {
          walletAddress: account.address,
          message,
          signature,
          timestamp,
        },
      });

      if (fnError) {
        console.error('Wallet auth function error:', fnError);
        setError(fnError.message || 'Failed to authenticate wallet');
        return null;
      }

      if (!data?.session) {
        setError('No session returned from authentication');
        return null;
      }

      // Set the Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        setError('Failed to establish session');
        return null;
      }

      return {
        session: data.session,
        user: data.user,
      };
    } catch (err: any) {
      console.error('Wallet authentication error:', err);
      setError(err.message || 'Authentication failed');
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [account]);

  return {
    authenticateWallet,
    isAuthenticating,
    error,
  };
}
