"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { TopLoadingBar } from "@/components/TopLoadingBar";

/** Max progress before route completes (cap at ~90%). */
const PROGRESS_CAP = 90;

/** Initial burst: 0 → 30% in this many ms. */
const INITIAL_DURATION_MS = 200;

/** Safety: auto-complete and hide after this many ms if route never completes. */
const SAFETY_TIMEOUT_MS = 6000;

/** Short completion state: show full bar for this many ms before hiding. */
const COMPLETION_VISIBLE_MS = 300;

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useTransition, setUseTransition] = useState(false);

  const pathnameRef = useRef(pathname);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reducedMotionRef = useRef(false);

  const completeAndHide = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = null;

    setUseTransition(true);
    setProgress(100);

    completionTimeoutRef.current = setTimeout(() => {
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
      setIsNavigating(false);
      setProgress(0);
      setUseTransition(false);
    }, COMPLETION_VISIBLE_MS);
  }, []);

  // Progress animation: 0 → 30% in ~200ms, then slower advance, cap at ~90%.
  useEffect(() => {
    if (!isNavigating) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = Date.now();
    setProgress(0);
    setUseTransition(false);

    if (reducedMotionRef.current) {
      setProgress(100);
      return;
    }

    const animate = () => {
      const start = startTimeRef.current;
      if (start == null) return;

      const elapsed = Date.now() - start;
      let next = 0;

      if (elapsed < INITIAL_DURATION_MS) {
        next = 30 * (elapsed / INITIAL_DURATION_MS);
      } else if (elapsed < 500) {
        next = 30 + 30 * ((elapsed - INITIAL_DURATION_MS) / 300);
      } else {
        const t = (elapsed - 500) / 1000;
        next = 60 + 30 * (1 - Math.exp(-t));
      }

      next = Math.min(PROGRESS_CAP, next);
      setProgress(next);

      if (next < PROGRESS_CAP) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isNavigating]);

  // Detect pathname change → complete bar then hide.
  useEffect(() => {
    if (pathname === pathnameRef.current) return;

    pathnameRef.current = pathname;

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    completeAndHide();
  }, [pathname, completeAndHide]);

  // Click (capture) and popstate: start navigation bar; safety timeout.
  useEffect(() => {
    reducedMotionRef.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      if (link.getAttribute("target") === "_blank") return;
      if (href.startsWith("http") || href.startsWith("//")) return;
      if (href === "#" || (href.startsWith("#") && !href.includes("/"))) return;
      if (!href.startsWith("/")) return;

      const current = pathnameRef.current;
      const nextPath = href.split("#")[0] || "/";
      if (nextPath === current) return;

      setIsNavigating(true);

      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        safetyTimeoutRef.current = null;
        completeAndHide();
      }, SAFETY_TIMEOUT_MS);
    };

    const handlePopState = () => {
      setIsNavigating(true);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        safetyTimeoutRef.current = null;
        completeAndHide();
      }, SAFETY_TIMEOUT_MS);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
    };
  }, [completeAndHide]);

  if (!isNavigating && progress === 0) return null;

  return (
    <TopLoadingBar
      progress={progress}
      useTransition={useTransition}
    />
  );
}
