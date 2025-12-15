import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import { ConnectEmbed } from "thirdweb/react";
import { getThirdwebClient } from '@/lib/thirdweb/client';
import { wallets } from '@/lib/thirdweb/wallets';
import { wzrdTheme } from '@/lib/thirdweb/theme';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ThirdwebClient } from "thirdweb";

const Login = () => {
  const navigate = useNavigate();
  const { user, thirdwebAccount } = useAuth();
  const [thirdwebClient, setThirdwebClient] = useState<ThirdwebClient | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Load Thirdweb client on mount
  useEffect(() => {
    getThirdwebClient()
      .then(setThirdwebClient)
      .catch((err) => {
        console.error('Failed to load Thirdweb client:', err);
        setConfigError(err.message);
      });
  }, []);
  
  // Redirect to home if already logged in (either Supabase or Thirdweb)
  useEffect(() => {
    if (user || thirdwebAccount) {
      navigate('/home');
    }
  }, [user, thirdwebAccount, navigate]);

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
          <div className="p-8 pb-4">
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
                <p className="text-sm text-muted-foreground mt-2">
                  Create cinematic AI-powered content
                </p>
              </div>
            </motion.div>
          </div>

          {/* Thirdweb Connect Embed */}
          <div className="px-4 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {configError ? (
                <div className="text-center py-8">
                  <p className="text-destructive text-sm">Failed to load authentication</p>
                  <p className="text-muted-foreground text-xs mt-2">{configError}</p>
                </div>
              ) : !thirdwebClient ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <ConnectEmbed
                  client={thirdwebClient}
                  wallets={wallets}
                  theme={wzrdTheme}
                  modalSize="compact"
                  showThirdwebBranding={false}
                  className="!w-full !bg-transparent !border-0"
                />
              )}
            </motion.div>
          </div>
        </GlassCard>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-muted-foreground text-sm mt-6"
        >
          By continuing, you agree to our Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
