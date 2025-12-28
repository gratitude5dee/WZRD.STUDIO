
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useActiveAccount } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  thirdwebAccount: Account | undefined;
  loading: boolean;
  isAuthenticated: boolean;
  authenticateWallet: () => Promise<boolean>;
  isWalletAuthenticating: boolean;
  walletAuthError: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null,
  thirdwebAccount: undefined,
  loading: true,
  isAuthenticated: false,
  authenticateWallet: async () => false,
  isWalletAuthenticating: false,
  walletAuthError: null,
});

// SECURITY: Auth bypass is ONLY allowed in development/test environments
// This flag should NEVER be enabled in production - it completely bypasses authentication
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('lovableproject.com') ||
   !window.location.hostname.includes('localhost'));

const bypassAuthForTests = 
  !isProductionDomain && // CRITICAL: Never bypass in production
  ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true') ||
   (typeof process !== 'undefined' && process.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true'));

// Runtime safety check - throw error if bypass somehow enabled in production
if (bypassAuthForTests && isProductionDomain) {
  console.error('SECURITY ERROR: Auth bypass attempted in production environment');
  throw new Error('Authentication bypass is not allowed in production');
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWalletAuthenticating, setIsWalletAuthenticating] = useState(false);
  const [walletAuthError, setWalletAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get thirdweb account from their hook
  const thirdwebAccount = useActiveAccount();
  
  // User is authenticated if Supabase user exists (wallet auth now creates Supabase users)
  const isAuthenticated = !!user;

  // Function to authenticate wallet with Supabase
  const authenticateWallet = useCallback(async (): Promise<boolean> => {
    if (!thirdwebAccount?.address) {
      setWalletAuthError('No wallet connected');
      return false;
    }

    // If already authenticated with same wallet, skip
    if (user?.user_metadata?.wallet_address?.toLowerCase() === thirdwebAccount.address.toLowerCase()) {
      return true;
    }

    setIsWalletAuthenticating(true);
    setWalletAuthError(null);

    try {
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with WZRD Studio.\n\nWallet: ${thirdwebAccount.address}\nTimestamp: ${timestamp}\n\nThis signature proves you own this wallet and does not authorize any transactions.`;

      // Sign the message using Thirdweb
      let signature: string;
      try {
        signature = await thirdwebAccount.signMessage({ message });
      } catch (signError: any) {
        if (signError.message?.includes('rejected') || signError.message?.includes('denied')) {
          setWalletAuthError('Signature request was rejected');
          return false;
        }
        throw signError;
      }

      // Call the wallet-auth edge function
      const { data, error: fnError } = await supabase.functions.invoke('wallet-auth', {
        body: {
          walletAddress: thirdwebAccount.address,
          message,
          signature,
          timestamp,
        },
      });

      if (fnError) {
        console.error('Wallet auth function error:', fnError);
        setWalletAuthError(fnError.message || 'Failed to authenticate wallet');
        return false;
      }

      if (!data?.session) {
        setWalletAuthError('No session returned from authentication');
        return false;
      }

      // Set the Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        setWalletAuthError('Failed to establish session');
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Wallet authentication error:', err);
      setWalletAuthError(err.message || 'Authentication failed');
      return false;
    } finally {
      setIsWalletAuthenticating(false);
    }
  }, [thirdwebAccount, user]);

  useEffect(() => {
    if (bypassAuthForTests) {
      setUser({
        id: 'test-user',
        aud: 'authenticated',
        email: 'asset-tests@local.dev',
        phone: '',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
        role: 'authenticated',
        last_sign_in_at: new Date().toISOString(),
        factors: [],
      } as unknown as User);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user just logged in and they're on the login page, redirect them
      if (session?.user && location.pathname === '/login') {
        navigate('/home');
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Auto-authenticate wallet when connected and no Supabase session exists
  useEffect(() => {
    if (thirdwebAccount && !user && !loading && !isWalletAuthenticating) {
      // Wallet connected but no Supabase user - trigger wallet auth
      authenticateWallet().then(success => {
        if (success && location.pathname === '/login') {
          navigate('/home');
        }
      });
    }
  }, [thirdwebAccount, user, loading, isWalletAuthenticating, authenticateWallet, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      thirdwebAccount, 
      loading: loading || isWalletAuthenticating, 
      isAuthenticated,
      authenticateWallet,
      isWalletAuthenticating,
      walletAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
