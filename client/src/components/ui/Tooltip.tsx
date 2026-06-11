"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "top", className }) => {
  const [isHovered, setIsHovered] = useState(false);

  const sideStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const animDirection = {
    top: { y: 4, x: "-50%" },
    bottom: { y: -4, x: "-50%" },
    left: { x: 4, y: "-50%" },
    right: { x: -4, y: "-50%" },
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, ...animDirection[side] }}
            animate={{ opacity: 1, x: side === "left" || side === "right" ? 0 : "-50%", y: 0 }}
            exit={{ opacity: 0, ...animDirection[side] }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 pointer-events-none rounded bg-zinc-950 px-2 py-1.5 text-xs text-zinc-50 border border-border shadow-md whitespace-nowrap",
              sideStyles[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
