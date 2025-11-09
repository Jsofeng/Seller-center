"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      duration={3500}
      toastOptions={{
        className: "text-sm font-medium",
      }}
    />
  );
}

