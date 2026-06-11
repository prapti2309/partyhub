import React from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            // Variants
            "bg-primary hover:bg-primary-hover text-white shadow": variant === "primary",
            "bg-panel hover:bg-panel/80 text-text-primary border border-border":
              variant === "secondary",
            "bg-error hover:bg-error/95 text-white": variant === "danger",
            "bg-transparent hover:bg-panel text-text-primary": variant === "ghost",
            "bg-transparent border border-border hover:bg-panel hover:text-text-primary text-text-secondary":
              variant === "outline",
            // Sizes
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
