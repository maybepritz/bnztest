"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-surface border border-border rounded-lg m-8">
      <h2 className="text-xl font-bold mb-4 text-primary">Что-то пошло не так</h2>
      <p className="text-secondary mb-6">
        {error.message.includes("fetch") || error.message.includes("network") 
          ? "Не удалось подключиться к серверу. Возможно, он сейчас выключен." 
          : "Произошла непредвиденная ошибка."}
      </p>
      <Button onClick={() => reset()}>Попробовать снова</Button>
    </div>
  );
}
