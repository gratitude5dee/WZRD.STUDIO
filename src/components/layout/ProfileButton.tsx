import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { ProfilePopup } from '@/components/profile/ProfilePopup';

export const ProfileButton = () => {
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsPopupOpen((prev) => !prev)}
        className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-transparent transition-colors hover:border-violet-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
          alt="Profile"
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-green-500" />
      </motion.button>

      <ProfilePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        anchorEl={buttonRef.current}
      />
    </>
  );
};

export default ProfileButton;
