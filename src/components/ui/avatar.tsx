"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import Image from "next/image";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", src, alt, name = "User", size = "md", ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    };

    const imageSizes = { sm: 32, md: 40, lg: 48 };
    const showImage = src && !imageError;

    return (
      <div
        ref={ref}
        className={`relative flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold ${sizes[size]} ${className}`}
        {...props}
      >
        {showImage ? (
          <Image
            src={src}
            alt={alt || name}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
export { Avatar };
