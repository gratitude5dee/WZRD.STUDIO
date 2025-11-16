
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/AuthProvider';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const bypassAuthForTests =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true') ||
    (typeof process !== 'undefined' && process.env?.VITE_BYPASS_AUTH_FOR_TESTS === 'true');
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bypassAuthForTests) {
        navigate('/assets');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      // Successful login - navigate to home
      navigate('/home');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bypassAuthForTests) {
        toast({
          title: 'Mock mode',
          description: 'Sign up disabled while tests bypass Supabase.',
        });
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Please check your email to verify your account"
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Animated Cosmic Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ background: 'radial-gradient(circle at 50% 50%, hsl(220 25% 6%) 0%, hsl(220 25% 4%) 100%)' }}
          animate={{
            background: [
              'radial-gradient(ellipse at 50% 30%, hsl(200 85% 20%) 0%, hsl(270 60% 18%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
              'radial-gradient(ellipse at 50% 30%, hsl(200 85% 25%) 0%, hsl(270 60% 20%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
              'radial-gradient(ellipse at 50% 30%, hsl(200 85% 20%) 0%, hsl(270 60% 18%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--glow-primary)) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--glow-secondary)) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, hsl(220 25% 4%) 100%)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? 'hsl(var(--glow-primary))' : i % 3 === 1 ? 'hsl(var(--glow-secondary))' : 'hsl(var(--glow-accent))',
              boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <GlassCard 
          variant="cosmic" 
          depth="deep" 
          glow="medium" 
          interactive="hover"
          shimmer
          className="overflow-hidden"
        >
          {/* Logo Header */}
          <div className="p-8 pb-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center gap-4 mb-6"
            >
              <AnimatedLogo size="lg" showVersion={true} autoplay={true} delay={0.5} />
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--glow-primary))] via-[hsl(var(--glow-secondary))] to-[hsl(var(--glow-accent))] bg-clip-text text-transparent">
                  Welcome to WZRD.STUDIO
                </h1>
                <p className="text-sm text-white/60 mt-2">
                  Create cinematic AI-powered content
                </p>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="p-8 pt-4">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--glow-primary))] data-[state=active]:to-[hsl(var(--glow-secondary))] data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--glow-secondary))] data-[state=active]:to-[hsl(var(--glow-accent))] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Email Address
                    </label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="w-full glass-input bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--glow-primary))] focus:ring-2 focus:ring-[hsl(var(--glow-primary)/0.2)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Password
                    </label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="w-full glass-input bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--glow-primary))] focus:ring-2 focus:ring-[hsl(var(--glow-primary)/0.2)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassButton 
                      type="submit" 
                      variant="cosmic"
                      size="lg"
                      glow="intense"
                      className="w-full group"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </GlassButton>
                  </motion.div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Email Address
                    </label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="w-full glass-input bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--glow-secondary))] focus:ring-2 focus:ring-[hsl(var(--glow-secondary)/0.2)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Password
                    </label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="w-full glass-input bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--glow-secondary))] focus:ring-2 focus:ring-[hsl(var(--glow-secondary)/0.2)]"
                    />
                    <p className="text-xs text-white/50 mt-2">
                      At least 8 characters recommended
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassButton 
                      type="submit" 
                      variant="stellar"
                      size="lg"
                      glow="intense"
                      className="w-full group"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </GlassButton>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </GlassCard>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/40 text-sm mt-6"
        >
          By continuing, you agree to our Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
