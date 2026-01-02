"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed tracking-tightest";

    // PRIMARY: Pastel Blue - main action buttons
    // SECONDARY: Cream background - secondary actions
    // All text uses pastel-blue-border (darker blue) for readability
    const variants = {
      primary: "bg-pastel-blue-border text-pastel-cream border-2 border-pastel-blue-border hover:bg-pastel-blue-text hover:shadow-lg hover:shadow-pastel-blue-border/30 focus:ring-2 focus:ring-pastel-blue shadow-[0_3px_0_0_rgba(74,123,199,1)] active:shadow-none",
      secondary: "bg-pastel-cream text-pastel-blue-border border-2 border-pastel-blue-border hover:bg-pastel-blue/30 hover:shadow-lg hover:shadow-pastel-blue/30 focus:ring-2 focus:ring-pastel-blue shadow-[0_3px_0_0_rgba(123,163,224,0.5)] active:shadow-none",
      outline: "bg-transparent text-pastel-blue-border border-2 border-pastel-blue-border hover:bg-pastel-blue/30 hover:shadow-lg hover:shadow-pastel-blue/20 focus:ring-2 focus:ring-pastel-blue",
      ghost: "text-pastel-blue-border hover:bg-pastel-blue/30 hover:shadow-md focus:ring-2 focus:ring-pastel-blue/20",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
