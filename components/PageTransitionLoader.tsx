"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { TopLoadingBar } from "@/components/ui/loader";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPathname = useRef(pathname);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Smooth progress animation using requestAnimationFrame
  useEffect(() => {
    if (isNavigating) {
      // Reset progress
      setProgress(0);
      startTimeRef.current = Date.now();
      
      // Clear any existing intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Smooth progress animation: starts fast, slows down (like nprogress)
      const animate = () => {
        if (!startTimeRef.current) return;
        
        const elapsed = Date.now() - startTimeRef.current;
        let newProgress = 0;
        
        // First 200ms: fast progress to 30%
        if (elapsed < 200) {
          newProgress = 30 * (elapsed / 200);
        }
        // Next 300ms: slower progress to 60%
        else if (elapsed < 500) {
          newProgress = 30 + 30 * ((elapsed - 200) / 300);
        }
        // After 500ms: very slow progress, max at 90%
        else {
          const additionalTime = elapsed - 500;
          newProgress = Math.min(90, 60 + 30 * (1 - Math.exp(-additionalTime / 1000)));
        }
        
        setProgress(newProgress);
        
        if (newProgress < 90) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Complete the progress when navigation finishes
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      startTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isNavigating]);

  // Track pathname changes to hide loader when navigation completes
  useEffect(() => {
    // If pathname changed, navigation completed
    if (pathname !== previousPathname.current) {
      previousPathname.current = pathname;
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
      
      // Complete progress smoothly
      setProgress(100);
      
      // Wait a bit before hiding to show completion
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        // Small delay before resetting progress to allow fade out
        setTimeout(() => {
          setProgress(0);
        }, 300);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Listen for link clicks to show loader immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        // Only show loader for internal links that are different from current path
        if (href && href.startsWith('/') && href !== pathname && !href.startsWith('#')) {
          setIsNavigating(true);
          
          // Safety fallback: always hide loader after 5 seconds max
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
          }
          maxTimeoutRef.current = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              setIsNavigating(false);
              setProgress(0);
            }, 300);
          }, 5000);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [pathname]);

  if (!isNavigating && progress === 0) return null;

  return <TopLoadingBar progress={progress} />;
}
