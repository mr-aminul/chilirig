"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart, useOrders } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const INACTIVITY_MS = 3000;
const IDLE_CHECK_INTERVAL_MS = 500;

export function Header() {
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex justify-center relative">
        <nav className={`relative rounded-full bg-white/20 backdrop-blur-2xl shadow-lg shadow-black/5 px-3 sm:px-6 py-2 w-full ${mobileMenuOpen ? '' : 'overflow-hidden'}`}>
          {/* Seamless glass gradient - single smooth layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10 group flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="text-black font-semibold text-base sm:text-lg tracking-tight">ChiliRig</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-black transition-all duration-200 rounded-full hover:bg-black/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Link href="/shop">
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
                  <X className="h-5 w-5 text-black" />
                ) : (
                  <Menu className="h-5 w-5 text-black" />
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
                  className="px-4 py-2 text-sm font-medium text-black transition-all duration-200 rounded-lg hover:bg-black/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/shop" 
                onClick={() => setMobileMenuOpen(false)}
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
