import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden backdrop-blur-2xl",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20 text-white shadow-lg shadow-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary-hover))] hover:shadow-xl hover:shadow-[hsl(var(--primary))]/30 hover:scale-105 active:scale-100",
        secondary:
          "bg-white/60 border border-black/10 text-[hsl(var(--text-primary))] shadow-lg shadow-black/5 hover:bg-white/80 hover:border-black/20 backdrop-blur-sm",
        ghost:
          "bg-white/40 border border-black/10 text-[hsl(var(--text-primary))] hover:bg-white/60 hover:border-black/20 backdrop-blur-sm",
        outline:
          "bg-transparent border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Glass effect gradient overlay for light mode */}
        {variant === "secondary" || variant === "ghost" ? (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-black/5 pointer-events-none" />
        ) : null}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
