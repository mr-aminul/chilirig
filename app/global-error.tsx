"use client";

import { useEffect } from "react";

/**
 * Renders when the root layout fails. Must include html and body (replaces root layout).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="max-w-md text-center text-gray-600">
            {process.env.NODE_ENV === "development"
              ? error.message
              : "Please refresh the page or try again in a moment."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
