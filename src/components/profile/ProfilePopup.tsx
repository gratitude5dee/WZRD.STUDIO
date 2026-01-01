import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  CreditCard,
  Users,
  LogOut,
  ChevronRight,
  Shield,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/hooks/useTheme';
import { ShineBorder } from '@/components/ui/shine-border';
import { NumberTicker } from '@/components/ui/number-ticker';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

interface ProfileData {
  full_name?: string | null;
  avatar_url?: string | null;
  workspace?: {
    name?: string | null;
  } | null;
}

export const ProfilePopup = ({ isOpen, onClose, anchorEl }: ProfilePopupProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const popupRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('profiles')
      .select('full_name, avatar_url, workspace:workspaces(name)')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data as ProfileData));

    supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const available = (data?.total_credits ?? 0) - (data?.used_credits ?? 0);
        setCredits(available);
      });
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const menuItems = [
    { icon: User, label: 'Profile', href: '/settings/profile' },
    { icon: Settings, label: 'Preferences', href: '/settings/preferences' },
    { icon: CreditCard, label: 'Plans & Credits', href: '/settings/billing' },
    { icon: Users, label: 'People & Workspace', href: '/settings/workspace' },
    { icon: Shield, label: 'Security', href: '/settings/security' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(5px)" }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-20 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
        >
          {/* Shine Border */}
          <ShineBorder
            shineColor={["#8B5CF6", "#EC4899"]}
            borderWidth={1}
            duration={6}
          />

          {/* Header */}
          <div className="border-b border-zinc-800/50 p-4 bg-gradient-to-br from-accent-purple/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  alt={profile?.full_name || 'User'}
                  className="h-12 w-12 rounded-full border-2 border-violet-500 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-900 bg-green-500" />
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <ShineBorder shineColor={["#8B5CF6"]} borderWidth={2} duration={2} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-white">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="truncate text-xs text-zinc-400">{user?.email}</p>
              </div>
            </div>

            {profile?.workspace && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-800/50 px-2 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-purple-600">
                  <span className="text-[10px] font-bold text-white">
                    {profile.workspace.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="flex-1 truncate text-xs text-zinc-300">
                  {profile.workspace.name}
                </span>
              </div>
            )}
          </div>

          {/* Credits Section */}
          <div className="border-b border-zinc-800/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-purple" />
                <span className="text-xs text-zinc-400">Available Credits</span>
              </div>
              <div className="flex items-center gap-1">
                <NumberTicker value={credits} className="text-sm font-bold text-white" />
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((credits / 10000) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              />
            </div>
          </div>

          {/* Menu Items */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-2"
          >
            {menuItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                variants={itemVariants}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-white group"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-4 w-4 group-hover:text-accent-purple transition-colors" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </motion.a>
            ))}
          </motion.div>

          {/* Theme Toggle */}
          <div className="border-t border-zinc-800/50 p-2">
            <motion.button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-white group"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 group-hover:text-accent-purple transition-colors" />
                ) : (
                  <Moon className="h-4 w-4 group-hover:text-accent-purple transition-colors" />
                )}
              </motion.div>
              <span className="flex-1 text-left">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </motion.button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-zinc-800/50 p-2">
            <motion.button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 group relative overflow-hidden"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePopup;
