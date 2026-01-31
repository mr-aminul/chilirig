"use client";

import { useMemo, useState, useEffect } from "react";

/** Bar height in pixels. Easy to tune. */
export const BAR_HEIGHT_PX = 3;

/** Duration for the final 100% and hide transition (ms). */
export const COMPLETE_DURATION_MS = 200;

export interface TopLoadingBarProps {
  /** Progress 0–100. When 100, bar shows full then can be hidden by parent. */
  progress: number;
  /** When true (e.g. prefers-reduced-motion), show a subtle indeterminate bar and skip progress animation. */
  indeterminate?: boolean;
  /** When true, use CSS transition for width (smooth completion to 100%). */
  useTransition?: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReducedMotion;
}

export function TopLoadingBar({
  progress,
  indeterminate: indeterminateProp = false,
  useTransition = false,
}: TopLoadingBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const indeterminate = indeterminateProp || prefersReducedMotion;

  const value = useMemo(
    () => Math.min(100, Math.max(0, progress)),
    [progress]
  );

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[9999] overflow-hidden"
      style={{
        height: BAR_HEIGHT_PX,
        transform: "translateZ(0)",
        willChange: indeterminate ? "opacity" : "transform",
      }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading"
      tabIndex={-1}
    >
      <div
        className="h-full bg-[hsl(var(--primary))]"
        style={{
          width: indeterminate ? "100%" : `${value}%`,
          transform: "translateZ(0)",
          transition: useTransition
            ? `width ${COMPLETE_DURATION_MS}ms ease-out`
            : "none",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
          opacity: indeterminate && prefersReducedMotion ? 0.9 : 1,
        }}
      />
    </div>
  );
}
