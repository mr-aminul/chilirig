"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
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
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="max-w-md text-center text-gray-600">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again or return to the home page."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
