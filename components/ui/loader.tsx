import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loaderVariants = cva(
  "inline-block rounded-full border-2 border-current border-t-transparent animate-spin",
  {
    variants: {
      size: {
        sm: "h-3 w-3 border-[1.5px]",
        md: "h-4 w-4 border-2",
        lg: "h-6 w-6 border-2",
        xl: "h-8 w-8 border-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  className?: string;
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ size, className }))}
        {...props}
        aria-label="Loading"
        role="status"
      />
    );
  }
);
Loader.displayName = "Loader";

// Full page overlay loader
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader size="xl" className="text-[hsl(var(--primary))]" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Top loading bar (like nprogress) - 2px thin bar at the very top
export function TopLoadingBar({ progress }: { progress?: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px]">
      <div
        className="h-full bg-[hsl(var(--primary))] transition-all duration-150 ease-linear"
        style={{
          width: progress !== undefined ? `${Math.min(100, Math.max(0, progress))}%` : '100%',
          transform: 'translateZ(0)', // Force hardware acceleration for smooth animation
        }}
      />
    </div>
  );
}

// Inline loader for buttons and small spaces
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return <Loader size={size} className="text-current" />;
}
