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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/hooks/useTheme';

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
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => setCredits(data?.balance || 0));
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-20 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        >
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  alt={profile?.full_name || 'User'}
                  className="h-12 w-12 rounded-full border-2 border-violet-500 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-900 bg-green-500" />
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

          <div className="border-b border-zinc-800 bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Credits</span>
              <span className="text-sm font-semibold text-violet-400">
                {credits.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((credits / 1000) * 100, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="p-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800"
              >
                <item.icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-violet-400" />
                <span className="flex-1 text-sm text-zinc-300">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
              </a>
            ))}

            <button
              onClick={toggleTheme}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-violet-400" />
              ) : (
                <Sun className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-violet-400" />
              )}
              <span className="flex-1 text-sm text-zinc-300">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div
                className={`h-5 w-8 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-violet-600' : 'bg-zinc-600'
                }`}
              >
                <motion.div
                  className="mt-0.5 h-4 w-4 rounded-full bg-white"
                  animate={{ x: theme === 'dark' ? 14 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          </div>

          <div className="border-t border-zinc-800 p-2">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-red-400" />
              <span className="text-sm text-zinc-300 transition-colors group-hover:text-red-400">
                Sign Out
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePopup;
