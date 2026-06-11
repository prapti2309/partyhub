"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

type ToastType = "success" | "warning" | "error" | "info";

interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, type = "info", duration = 3000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "success" }),
    [toast]
  );
  const error = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "error" }),
    [toast]
  );
  const warning = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "warning" }),
    [toast]
  );
  const info = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "info" }),
    [toast]
  );

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-primary" />,
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg shadow-lg border bg-surface/95 backdrop-blur border-border glass relative overflow-hidden group"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">{icons[t.type || "info"]}</div>

              {/* Text */}
              <div className="flex-1 pr-4">
                {t.title && (
                  <h4 className="font-semibold text-sm text-text-primary mb-0.5">{t.title}</h4>
                )}
                <p className="text-xs text-text-secondary leading-relaxed">{t.message}</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded-full hover:bg-panel text-text-secondary hover:text-text-primary transition-opacity cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
