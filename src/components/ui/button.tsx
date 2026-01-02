"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-tightest touch-manipulation";

    // PRIMARY: Pastel Blue - main action buttons
    // SECONDARY: Cream background - secondary actions
    // All text uses pastel-blue-border (darker blue) for readability
    const variants = {
      primary: "bg-pastel-blue-border text-pastel-cream border-2 border-pastel-blue-border hover:bg-pastel-blue-text focus:ring-2 focus:ring-pastel-blue shadow-[0_3px_0_0_rgba(74,123,199,1)] active:shadow-none active:translate-y-[2px]",
      secondary: "bg-pastel-cream text-pastel-blue-border border-2 border-pastel-blue-border hover:bg-pastel-blue/30 focus:ring-2 focus:ring-pastel-blue shadow-[0_3px_0_0_rgba(123,163,224,0.5)] active:shadow-none active:translate-y-[2px]",
      outline: "bg-transparent text-pastel-blue-border border-2 border-pastel-blue-border hover:bg-pastel-blue/30 focus:ring-2 focus:ring-pastel-blue",
      ghost: "text-pastel-blue-border hover:bg-pastel-blue/30 focus:ring-2 focus:ring-pastel-blue/20",
    };

    const sizes = {
      sm: "h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm",
      md: "h-10 sm:h-12 px-4 sm:px-6 text-sm",
      lg: "h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base",
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
