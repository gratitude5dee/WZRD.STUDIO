
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const bypassAuthForTests =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true') ||
  (typeof process !== 'undefined' && process.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true');

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [navigate, location.pathname, bypassAuthForTests]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
