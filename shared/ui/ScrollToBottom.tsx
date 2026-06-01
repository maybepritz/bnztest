"use client";

import { useEffect, useRef } from "react";

export function ScrollToBottom({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom only if enabled
    if (enabled && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  return <div ref={ref} className="h-px w-full flex-shrink-0" />;
}
