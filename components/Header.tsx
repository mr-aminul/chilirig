"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart, useOrders } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCachedApiJson } from "@/lib/api-cache";

const INACTIVITY_MS = 3000;
const IDLE_CHECK_INTERVAL_MS = 500;

export function Header() {
  const router = useRouter();
  const itemCount = useCart((state) => state.getItemCount());
  const lastAddedAt = useCart((state) => state.lastAddedAt);
  const clearJustAdded = useCart((state) => state.clearJustAdded);
  const orderCount = useOrders((state) => state.orders.length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [attractAttention, setAttractAttention] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lastAddedAt) return;
    setBounce(true);
    const t = setTimeout(() => {
      setBounce(false);
      clearJustAdded();
    }, 600);
    return () => clearTimeout(t);
  }, [lastAddedAt, clearJustAdded]);

  // When user is inactive for 3s and cart has items, grab attention; clear on any activity
  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
      setAttractAttention(false);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, markActive));

    const interval = setInterval(() => {
      if (itemCount > 0 && Date.now() - lastActivityRef.current >= INACTIVITY_MS) {
        setAttractAttention(true);
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActive));
      clearInterval(interval);
    };
  }, [itemCount]);

  const navLinks = [
    { href: "/story", label: "Story" },
    { href: "/recipes", label: "Recipes" },
    { href: "/faq", label: "FAQ" },
    ...(mounted && orderCount > 0 ? [{ href: "/orders", label: "Your Orders" }] : []),
  ];

  const prefetchRoute = (href: string) => {
    router.prefetch(href);
  };

  const goTo = (
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

  useEffect(() => {
    const runWarmup = async () => {
      try {
        // Route bundle prefetch
        router.prefetch("/");
        router.prefetch("/shop");
        router.prefetch("/recipes");
        router.prefetch("/story");
        router.prefetch("/faq");

        // Warm data for major public pages
        await Promise.allSettled([
          getCachedApiJson("/api/products", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/recipes", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/story", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/faq", { ttlMs: 10 * 60 * 1000 }),
          getCachedApiJson("/api/reviews", { ttlMs: 10 * 60 * 1000 }),
        ]);
      } catch {
        // best-effort optimization only
      }
    };

    const timer = window.setTimeout(runWarmup, 200);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-0 sm:px-6 sm:pt-4 lg:px-8">
      <div className="relative mx-auto flex w-full justify-center sm:w-3/4 md:w-2/3 lg:w-1/2">
        <nav
          className={`relative w-full rounded-full bg-white/20 px-3 py-1.5 shadow-lg shadow-black/5 backdrop-blur-2xl sm:px-6 sm:py-2 ${mobileMenuOpen ? "" : "overflow-hidden"}`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between gap-2">
            {/* Logo */}
            <Link
              href="/"
              prefetch
              onMouseEnter={() => prefetchRoute("/")}
              onFocus={() => prefetchRoute("/")}
              onTouchStart={() => prefetchRoute("/")}
              onClick={(e) => goTo(e, "/")}
              className="flex items-center space-x-2 z-10 group flex-shrink-0"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-black sm:text-lg">ChiliRig</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onMouseEnter={() => prefetchRoute(link.href)}
                  onFocus={() => prefetchRoute(link.href)}
                  onTouchStart={() => prefetchRoute(link.href)}
                  onClick={(e) => goTo(e, link.href)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-black/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Link
                href="/shop"
                prefetch
                onMouseEnter={() => prefetchRoute("/shop")}
                onFocus={() => prefetchRoute("/shop")}
                onTouchStart={() => prefetchRoute("/shop")}
                onClick={(e) => goTo(e, "/shop")}
              >
                <Button 
                  size="sm" 
                  variant="default"
                  className="hidden sm:flex"
                >
                  Shop Now
                </Button>
              </Link>

              {/* Mobile menu button - Always visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 text-black sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 text-black sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu - Outside nav to avoid overflow clipping */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white/20 backdrop-blur-2xl shadow-lg shadow-black/5 overflow-hidden z-50">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
            <nav className="relative flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onMouseEnter={() => prefetchRoute(link.href)}
                  onFocus={() => prefetchRoute(link.href)}
                  onTouchStart={() => prefetchRoute(link.href)}
                  onClick={(e) => {
                    goTo(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-black/10"
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/shop"
                prefetch
                onMouseEnter={() => prefetchRoute("/shop")}
                onFocus={() => prefetchRoute("/shop")}
                onTouchStart={() => prefetchRoute("/shop")}
                onClick={(e) => {
                  goTo(e, "/shop");
                  setMobileMenuOpen(false);
                }}
                className="mt-2"
              >
                <Button 
                  size="sm" 
                  variant="default"
                  className="w-full"
                >
                  Shop Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Floating Cart Bubble - Only show after mount to avoid hydration mismatch with persisted cart */}
      {mounted && itemCount > 0 && (
        <Link
          href="/checkout"
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Shopping cart"
        >
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{
              scale: bounce
                ? [1, 1.4, 1]
                : attractAttention
                  ? [1, 1.12, 1]
                  : 1,
            }}
            transition={
              bounce
                ? { duration: 0.4, ease: "easeOut" }
                : attractAttention
                  ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.5 }
                  : { type: "spring", stiffness: 400, damping: 28 }
            }
          >
            <div className={`w-14 h-14 rounded-full bg-[hsl(var(--primary))] shadow-lg shadow-black/20 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/30 ${attractAttention ? "ring-4 ring-[hsl(var(--primary))] ring-opacity-60 animate-pulse" : ""}`}>
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[hsl(var(--primary))] shadow-lg ring-2 ring-[hsl(var(--primary))]/20"
            >
              {itemCount}
            </motion.span>
          </motion.div>
        </Link>
      )}
    </header>
  );
}
