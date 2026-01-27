"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const itemCount = useCart((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/story", label: "Story" },
    { href: "/recipes", label: "Recipes" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-1/2 flex justify-center">
        <nav className="relative rounded-full border border-black/10 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-black/10 px-6 py-2 w-full">
          {/* Glass effect overlay with gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/60 via-transparent to-black/5" />
          
          <div className="relative flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10 group">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="text-[hsl(var(--text-primary))] font-semibold text-lg tracking-tight">ChiliRig</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 rounded-full hover:bg-black/5 hover:text-[hsl(var(--text-primary))]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <Link href="/shop">
                <Button 
                  size="sm" 
                  variant="default"
                  className="hidden sm:flex"
                >
                  Shop Now
                </Button>
              </Link>
              
              <Link href="/checkout" className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-white shadow-lg ring-2 ring-white/20">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-black/10 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-black/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-black/5" />
              <nav className="relative flex flex-col p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 rounded-lg hover:bg-black/5 hover:text-[hsl(var(--text-primary))]"
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
        </nav>
      </div>
    </header>
  );
}
