import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    // All cards use pastel blue palette - no white/black
    const variants = {
      default: "bg-pastel-blue/40 backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(123,163,224,0.2)]",
      bordered: "bg-pastel-blue/30 backdrop-blur-sm border-2 border-pastel-blue-border/40",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export { Card };
