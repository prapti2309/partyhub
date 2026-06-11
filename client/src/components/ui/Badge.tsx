import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "primary", ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide border transition-colors",
        {
          "bg-primary/10 border-primary/20 text-primary": variant === "primary",
          "bg-panel border-border text-text-secondary": variant === "secondary",
          "bg-success/10 border-success/20 text-success": variant === "success",
          "bg-warning/10 border-warning/20 text-warning": variant === "warning",
          "bg-danger/10 border-danger/20 text-error": variant === "danger",
          "border-border text-text-secondary bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
};
Badge.displayName = "Badge";
