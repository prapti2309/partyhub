"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export interface DropdownItem {
  label: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Items list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-md border border-border bg-surface shadow-lg glass focus:outline-none p-1.5 min-w-[12rem]",
              {
                "left-0 origin-top-left": align === "left",
                "right-0 origin-top-right": align === "right",
              }
            )}
          >
            <div className="py-1 flex flex-col gap-0.5">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.disabled) return;
                    if (item.onClick) item.onClick();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-sm text-text-primary rounded-md transition-colors hover:bg-panel focus:outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                    item.className
                  )}
                >
                  {item.icon && <span className="mr-2.5 text-text-secondary">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
