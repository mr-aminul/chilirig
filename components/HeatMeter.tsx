import { HeatLevel } from "@/data/products";
import { cn } from "@/lib/utils";

interface HeatMeterProps {
  level: HeatLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const heatLabels: Record<HeatLevel, string> = {
  1: "Mild",
  2: "Medium",
  3: "Hot",
  4: "Very Hot",
  5: "Extreme",
};

export function HeatMeter({ level, size = "md", showLabel = true }: HeatMeterProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              sizeClasses[size],
              "w-2 rounded-full transition-all",
              i <= level
                ? "bg-[hsl(var(--primary))]"
                : "bg-gray-300"
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">
          {heatLabels[level]}
        </span>
      )}
    </div>
  );
}
