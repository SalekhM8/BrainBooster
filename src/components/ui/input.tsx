"use client";

import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-pastel-blue-border mb-2 tracking-tightest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={`
            w-full h-12 px-4 rounded-xl border-2 text-pastel-blue-text text-sm tracking-tightest font-medium
            placeholder:text-pastel-blue-border/50
            bg-pastel-cream/80 backdrop-blur-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pastel-blue-border/50 focus:border-pastel-blue-border focus:bg-pastel-cream
            disabled:bg-pastel-blue/30 disabled:cursor-not-allowed
            ${error ? "border-pastel-blue-text bg-pastel-blue/20" : "border-pastel-blue-border/40 hover:border-pastel-blue-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-xs font-bold text-pastel-blue-text tracking-tightest">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
