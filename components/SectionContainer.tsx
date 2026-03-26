import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  background?: "default" | "light" | "dark" | "theme";
  className?: string;
  /** Merged with inner wrapper (e.g. override max width: `max-w-[80vw]`). */
  innerClassName?: string;
}

export function SectionContainer({
  children,
  background = "default",
  className,
  innerClassName,
}: SectionContainerProps) {
  const backgroundClasses = {
    default: "bg-[hsl(var(--bg-primary))]",
    light: "bg-[hsl(var(--bg-secondary))]",
    dark: "bg-[hsl(var(--bg-tertiary))]",
    theme: "bg-[hsl(var(--bg-theme))] text-white",
  };

  return (
    <section
      className={cn(
        "section-padding",
        backgroundClasses[background],
        background === "theme" && "bg-theme",
        className
      )}
    >
      <div
        className={cn(
          "container-padding mx-auto max-w-7xl",
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
