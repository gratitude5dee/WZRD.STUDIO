import { motion } from 'framer-motion';

interface AddSceneButtonProps {
  onClick: () => void;
  className?: string;
}

export const AddSceneButton = ({ onClick, className }: AddSceneButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 ${className ?? ''}`}
      whileHover={{ rotate: 90, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      aria-label="Add first scene"
    >
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-2xl text-white"
        whileHover={{ rotate: -90 }}
      >
        +
      </motion.span>
      <span className="pointer-events-none absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-violet-400 via-purple-500 to-violet-400 bg-[length:200%_200%] bg-clip-border animate-border-flow" />
    </motion.button>
  );
};

export default AddSceneButton;
