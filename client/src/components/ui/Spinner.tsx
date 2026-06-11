import React from "react";
import { cn } from "../../lib/utils";

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement>;

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent h-5 w-5 inline-block",
        className
      )}
      {...props}
    />
  );
};
