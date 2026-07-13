"use client";

import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          },
        }}
      />
    </>
  );
}
