import * as React from "react";

import { cn } from "@/modules/core/lib/utils";
import { LucideIcon } from "lucide-react";

function Input({
  className,
  containerClassName,
  error,
  type,
  icon,
  ...props
}: React.ComponentProps<"input"> & {
  error?: string;
  containerClassName?: string;
  icon?: {
    name: LucideIcon;
    className?: string;
    position?: "left" | "right";
  };
}) {
  const Icon = icon?.name;
  const iconPosition = icon?.position || "left";
  const hasIcon = !!Icon;

  return (
    <div className={cn("w-full", containerClassName)}>
      {/* Input Container - All styling here */}
      <div
        className={cn(
          "relative flex items-center w-full h-12 rounded-md border border-input bg-background shadow-xs transition-[border-color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          error &&
            "border-destructive ring-destructive/20 dark:ring-destructive/40",
          className,
        )}
      >
        {/* Left Icon */}
        {hasIcon && iconPosition === "left" && (
          <Icon
            className={cn(
              "absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none",
              icon.className,
            )}
          />
        )}

        {/* Transparent Input */}
        <input
          type={type}
          className={cn(
            "w-full h-full bg-transparent border-none outline-none text-base md:text-sm",
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "disabled:cursor-not-allowed",
            hasIcon && iconPosition === "left" && "pl-10 pr-3",
            hasIcon && iconPosition === "right" && "pl-3 pr-10",
            !hasIcon && "px-3",
          )}
          {...props}
        />

        {/* Right Icon */}
        {hasIcon && iconPosition === "right" && (
          <Icon
            className={cn(
              "absolute right-3 h-5 w-5 text-muted-foreground pointer-events-none",
              icon.className,
            )}
          />
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export { Input };
