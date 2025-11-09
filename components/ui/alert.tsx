"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const variants = {
  default: "border-slate-200 bg-white text-slate-900",
  destructive: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex w-full gap-2 rounded-md border px-3 py-2 text-sm",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

export { Alert };

