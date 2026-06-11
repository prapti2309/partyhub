"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}) => {
  // Prevent body scrolling when open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full max-w-md rounded-lg border border-border bg-surface text-text-primary p-6 shadow-lg glass z-10",
              {
                "max-w-sm": size === "sm",
                "max-w-md": size === "md",
                "max-w-lg": size === "lg",
                "max-w-2xl": size === "xl",
              },
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            {title && (
              <div className="flex flex-col space-y-1.5 text-left mb-4">
                <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
              </div>
            )}

            {/* Body */}
            <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
