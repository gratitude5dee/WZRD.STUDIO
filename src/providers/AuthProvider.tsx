
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useActiveAccount } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';

interface AuthContextType {
  user: User | null;
  thirdwebAccount: Account | undefined;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  thirdwebAccount: undefined,
  loading: true,
  isAuthenticated: false,
});

const bypassAuthForTests =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true') ||
  (typeof process !== 'undefined' && process.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true');

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get thirdweb account from their hook
  const thirdwebAccount = useActiveAccount();
  
  // User is authenticated if either Supabase user OR thirdweb account exists
  const isAuthenticated = !!(user || thirdwebAccount);

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      
      // If user just logged in and they're not on the home page already, redirect them
      if (currentUser && location.pathname === '/login') {
        navigate('/home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Handle thirdweb account connection - redirect to home when connected
  useEffect(() => {
    if (thirdwebAccount && location.pathname === '/login') {
      navigate('/home');
    }
  }, [thirdwebAccount, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ user, thirdwebAccount, loading, isAuthenticated }}>
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
