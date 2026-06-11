import React, { useState } from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy";
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  status,
  ...props
}) => {
  const [error, setError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={cn("relative inline-block flex-shrink-0 select-none", className)} {...props}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center bg-panel border border-border font-semibold text-text-primary text-center",
          {
            "h-6 w-6 text-[10px]": size === "xs",
            "h-8 w-8 text-xs": size === "sm",
            "h-10 w-10 text-sm": size === "md",
            "h-12 w-12 text-base": size === "lg",
            "h-16 w-16 text-lg": size === "xl",
          }
        )}
      >
        {src && !error ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(fallback || alt || "?")}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            {
              "h-2 w-2": size === "xs" || size === "sm",
              "h-2.5 w-2.5": size === "md",
              "h-3.5 w-3.5": size === "lg" || size === "xl",
            },
            {
              "bg-success": status === "online",
              "bg-text-secondary": status === "offline",
              "bg-warning": status === "away",
              "bg-error": status === "busy",
            }
          )}
        />
      )}
    </div>
  );
};
Avatar.displayName = "Avatar";
