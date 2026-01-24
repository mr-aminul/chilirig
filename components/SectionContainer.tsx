import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  background?: "default" | "light" | "dark" | "theme";
  className?: string;
}

export function SectionContainer({
  children,
  background = "default",
  className,
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
      <div className="container-padding mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
