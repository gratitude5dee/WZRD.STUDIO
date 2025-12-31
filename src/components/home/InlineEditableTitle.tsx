import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const titleSchema = z.string().trim().min(1, 'Title required').max(100, 'Max 100 characters');

interface InlineEditableTitleProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
}

export const InlineEditableTitle = ({
  initialValue,
  onSave,
  onCancel,
  className,
}: InlineEditableTitleProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    try {
      const validated = titleSchema.parse(value);
      setError(null);
      onSave(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex flex-col gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            'flex-1 px-2 py-1 text-base font-semibold rounded-lg',
            'bg-surface-2 border-2 border-accent-purple text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent-purple/30',
            'dark:bg-zinc-800 dark:border-purple-500 dark:text-white',
            error && 'border-accent-rose focus:ring-accent-rose/30',
            className
          )}
          maxLength={100}
        />
        <button
          onClick={handleSave}
          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-surface-3 hover:bg-surface-2 text-text-secondary transition-colors dark:bg-zinc-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-accent-rose pl-2"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};
