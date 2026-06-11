"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right" | "bottom";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  side = "right",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const slideVariants = {
    hidden: {
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "bottom" ? "100%" : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: { type: "tween" as const, duration: 0.25, ease: "easeOut" as const },
    },
    exit: {
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "bottom" ? "100%" : 0,
      transition: { type: "tween" as const, duration: 0.2, ease: "easeIn" as const },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Content */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed bg-surface border-border text-text-primary shadow-xl glass z-10 flex flex-col p-6",
              {
                // Right panel
                "right-0 top-0 bottom-0 h-full w-full max-w-sm border-l": side === "right",
                // Left panel
                "left-0 top-0 bottom-0 h-full w-full max-w-sm border-r": side === "left",
                // Bottom drawer
                "bottom-0 left-0 right-0 w-full h-[75vh] border-t rounded-t-xl": side === "bottom",
              },
              className
            )}
          >
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              {title ? <h2 className="text-lg font-semibold">{title}</h2> : <div />}
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-text-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Inner Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
