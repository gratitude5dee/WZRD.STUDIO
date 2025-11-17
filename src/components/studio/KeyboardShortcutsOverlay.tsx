/**
 * Keyboard Shortcuts Overlay
 * Shows available keyboard shortcuts in a beautiful overlay
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { STUDIO_SHORTCUTS } from '@/hooks/studio/useStudioKeyboardShortcuts';
import { studioTheme, studioTypography } from '@/lib/studio/theme';

export const KeyboardShortcutsOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm transition-all hover:shadow-lg"
        style={{
          background: studioTheme.bg.secondary,
          borderColor: studioTheme.border.default,
          color: studioTheme.text.secondary,
          fontSize: studioTypography.fontSize.sm,
        }}
      >
        <Keyboard className="w-4 h-4" />
        <span>Shortcuts</span>
        <kbd className="px-2 py-0.5 rounded text-xs font-mono" style={{
          background: studioTheme.bg.primary,
          color: studioTheme.text.tertiary,
        }}>
          ?
        </kbd>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] rounded-xl border shadow-2xl max-h-[80vh] overflow-y-auto"
              style={{
                width: 600,
                background: studioTheme.bg.secondary,
                borderColor: studioTheme.border.default,
              }}
            >
              {/* Header */}
              <div
                className="sticky top-0 flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm z-10"
                style={{
                  background: `${studioTheme.bg.secondary}f0`,
                  borderColor: studioTheme.border.subtle,
                }}
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5" style={{ color: studioTheme.accent.purple }} />
                  <h2 className="font-semibold" style={{
                    fontSize: studioTypography.fontSize.lg,
                    color: studioTheme.text.primary,
                  }}>
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-all hover:bg-white/5"
                  style={{ color: studioTheme.text.secondary }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {Object.entries(STUDIO_SHORTCUTS).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3
                      className="font-semibold mb-3 capitalize"
                      style={{
                        fontSize: studioTypography.fontSize.md,
                        color: studioTheme.text.primary,
                      }}
                    >
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(shortcuts).map(([key, description]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2 px-3 rounded-lg"
                          style={{
                            background: studioTheme.bg.tertiary,
                            borderBottom: `1px solid ${studioTheme.border.subtle}`,
                          }}
                        >
                          <span style={{
                            fontSize: studioTypography.fontSize.base,
                            color: studioTheme.text.secondary,
                          }}>
                            {description}
                          </span>
                          <kbd
                            className="px-3 py-1 rounded font-mono shadow-sm"
                            style={{
                              fontSize: studioTypography.fontSize.sm,
                              background: studioTheme.bg.primary,
                              color: studioTheme.text.primary,
                              border: `1px solid ${studioTheme.border.default}`,
                            }}
                          >
                            {key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="sticky bottom-0 px-6 py-4 border-t text-center backdrop-blur-sm"
                style={{
                  background: `${studioTheme.bg.secondary}f0`,
                  borderColor: studioTheme.border.subtle,
                  fontSize: studioTypography.fontSize.sm,
                  color: studioTheme.text.tertiary,
                }}
              >
                Press <kbd className="px-2 py-0.5 rounded font-mono mx-1" style={{
                  background: studioTheme.bg.primary,
                  color: studioTheme.text.secondary,
                }}>?</kbd> or <kbd className="px-2 py-0.5 rounded font-mono mx-1" style={{
                  background: studioTheme.bg.primary,
                  color: studioTheme.text.secondary,
                }}>Esc</kbd> to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
