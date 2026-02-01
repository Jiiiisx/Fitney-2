"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface UserAvatarProps {
  user?: {
    fullName?: string | null;
    imageUrl?: string | null;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl",
  };

  if (!user) {
    return (
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center border border-border/50 shrink-0",
        sizeClasses[size],
        className
      )}>
        <User className="text-muted-foreground w-1/2 h-1/2" />
      </div>
    );
  }

  if (user.imageUrl && !imgError) {
    return (
      <img
        src={user.imageUrl}
        alt={user.fullName || "User"}
        className={cn(
          "rounded-full object-cover border border-primary/10 shrink-0",
          sizeClasses[size],
          className
        )}
        onError={() => setImgError(true)}
      />
    );
  }

  const initials = (user.fullName || '')
    .split(" ")
    .filter(n => n)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center border-2 border-white shadow-sm shrink-0",
      sizeClasses[size],
      className
    )}>
      <span className="text-primary-foreground font-black tracking-tighter">
        {initials}
      </span>
    </div>
  );
}
