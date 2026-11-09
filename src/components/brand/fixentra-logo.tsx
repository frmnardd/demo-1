import * as React from "react";
import { cn } from "@/lib/utils";

interface FixentraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function FixentraLogo({
  className,
  size = "md",
  showText = true,
}: FixentraLogoProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-500 text-white shadow-md shadow-primary/20",
          sizeClasses[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 stroke-current stroke-2"
        >
          <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 7L12 12L3 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8L16 10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Fixentra
            </span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary border border-primary/20">
              v2.0
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground tracking-tight">
            fixentra.my.id
          </span>
        </div>
      )}
    </div>
  );
}
