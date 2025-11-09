import * as React from "react";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
}

export function Avatar({ name, className, ...props }: AvatarProps) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "S";

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {initials}
    </div>
  );
}

