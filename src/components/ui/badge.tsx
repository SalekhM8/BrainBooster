import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    // PRIMARY: Pastel blue - use for most badges
    // Only use other colors when semantically necessary (success/warning/error)
    const variants = {
      default: "bg-pastel-blue/50 text-pastel-blue-border border border-pastel-blue-border/40",
      primary: "bg-pastel-blue-border text-pastel-cream border border-pastel-blue-border",
      success: "bg-pastel-blue/60 text-pastel-blue-text border border-pastel-blue-border/50",
      warning: "bg-pastel-blue/40 text-pastel-blue-border border border-pastel-blue-border/30",
      error: "bg-pastel-blue-border/20 text-pastel-blue-text border border-pastel-blue-border/40",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-tightest ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
export { Badge };
