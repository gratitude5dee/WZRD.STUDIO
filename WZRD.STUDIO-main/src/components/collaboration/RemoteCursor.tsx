// ============================================================================
// COMPONENT: Remote Cursor Display
// PURPOSE: Show other users' cursors in real-time
// ============================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CursorPosition } from "@/types/collaboration";

interface RemoteCursorProps {
  cursor: CursorPosition;
}

export const RemoteCursor: React.FC<RemoteCursorProps> = ({ cursor }) => {
  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      initial={{ x: cursor.x, y: cursor.y, opacity: 0 }}
      animate={{ x: cursor.x, y: cursor.y, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      style={{ left: 0, top: 0 }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M5.5 4L18.5 11L11 13.5L8.5 21L5.5 4Z"
          fill={cursor.cursorColor}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name tag */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="ml-6 -mt-2 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: cursor.cursorColor,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {cursor.displayName}
      </motion.div>
    </motion.div>
  );
};

// Container to render all remote cursors
interface RemoteCursorsProps {
  cursors: Record<string, CursorPosition>;
  currentPage?: string;
}

export const RemoteCursors: React.FC<RemoteCursorsProps> = ({
  cursors,
  currentPage,
}) => {
  // Filter cursors to only show those on the current page
  const filteredCursors = Object.values(cursors).filter(
    (cursor) => !currentPage || cursor.page === currentPage
  );

  return (
    <AnimatePresence>
      {filteredCursors.map((cursor) => (
        <RemoteCursor key={cursor.sessionId} cursor={cursor} />
      ))}
    </AnimatePresence>
  );
};

// Cursor follower component for highlighting selections
interface CursorFollowerProps {
  position: { x: number; y: number };
  color: string;
  children?: React.ReactNode;
}

export const CursorFollower: React.FC<CursorFollowerProps> = ({
  position,
  color,
  children,
}) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-[9998]"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      style={{ left: 0, top: 0 }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: color,
          boxShadow: `0 0 0 2px white, 0 0 8px ${color}`,
        }}
      />
      {children}
    </motion.div>
  );
};
