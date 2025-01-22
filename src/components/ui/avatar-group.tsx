
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export function AvatarGroup({
  children,
  className,
  max = 5,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const totalAvatars = childrenArray.length;
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingAvatars = totalAvatars - max;

  return (
    <div
      className={cn("flex items-center -space-x-2", className)}
      {...props}
    >
      {visibleAvatars.map((child, i) => (
        <div key={i} className="relative hover:z-10">
          {child}
        </div>
      ))}
      {remainingAvatars > 0 && (
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
          +{remainingAvatars}
        </div>
      )}
    </div>
  );
}