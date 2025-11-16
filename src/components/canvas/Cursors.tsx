import { motion, AnimatePresence } from 'framer-motion';
import type { PresenceUser } from '@/hooks/usePresence';

interface CursorsProps {
  users: Record<string, PresenceUser>;
  currentUserId?: string;
}

export function Cursors({ users, currentUserId }: CursorsProps) {
  const otherUsers = Object.values(users).filter(u => u.userId !== currentUserId && u.cursor);

  return (
    <AnimatePresence>
      {otherUsers.map((user) => (
        <motion.div
          key={user.userId}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          style={{
            position: 'absolute',
            left: user.cursor!.x,
            top: user.cursor!.y,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          transition={{ duration: 0.1 }}
        >
          {/* Cursor arrow */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: 'translate(-2px, -2px)' }}
          >
            <path
              d="M5.65376 12.3673L12.6269 5.39419C13.2494 4.77173 14.3088 5.20657 14.3088 6.07458V17.9254C14.3088 18.7934 13.2494 19.2283 12.6269 18.6058L5.65376 11.6327C5.29825 11.2772 5.29825 10.7228 5.65376 10.3673Z"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>

          {/* User label */}
          <div className="absolute left-6 top-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
            {user.username}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
