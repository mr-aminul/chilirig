"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { defaultHeroContent, HeroSlide } from "@/data/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  slides?: HeroSlide[];
}

export function Hero({ slides = defaultHeroContent.slides }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = slides.length > 0 ? slides : defaultHeroContent.slides;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    if (activeSlide >= heroSlides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, heroSlides.length]);

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden pt-24">
      <div className="absolute inset-0 w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
        <div
          className="absolute inset-0 bg-gradient-radial from-[hsl(var(--primary))]/20 via-transparent to-transparent opacity-50"
          style={{ background: "radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.2) 0%, transparent 60%)" }}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.01] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 h-full flex items-center">
        <div className="container-padding mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/80 backdrop-blur-sm text-[hsl(var(--text-primary))] border border-black/10 hover:bg-white/90 transition-all">
                  Small batch
                </Badge>
                <Badge className="bg-white/80 backdrop-blur-sm text-[hsl(var(--text-primary))] border border-black/10 hover:bg-white/90 transition-all">
                  No preservatives
                </Badge>
                <Badge className="bg-white/80 backdrop-blur-sm text-[hsl(var(--text-primary))] border border-black/10 hover:bg-white/90 transition-all">
                  Real ingredients
                </Badge>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl font-display font-bold leading-tight text-white sm:text-6xl lg:text-7xl tracking-tight drop-shadow-lg">
                Blazing flavor, bottled for you.
              </h1>

              {/* Sub-headline */}
              <p className="max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-md sm:text-lg">
                Heat with depth. Flavor with bite. Our premium chili oil is
                slow-infused with real chilies, garlic, and premium oils. Crafted
                for those who demand bold taste.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row pt-2">
                <Link href="/shop">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link href="/story">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto"
                  >
                    Our Story
                  </Button>
                </Link>
              </div>

              {/* Microcopy */}
              <p className="text-sm text-white/80 pt-2 drop-shadow-sm">
                Ships in 24 hours • Free shipping on orders over ৳5,000
              </p>

              <div className="flex items-center gap-2 pt-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show hero slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
