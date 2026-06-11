import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            {
              "border-error focus-visible:ring-error focus-visible:border-error": error,
            },
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-error font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
