"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden pt-24">
      {/* Full-width background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/hero/hero-main.png"
          alt="ChiliRig - Fiery chili oil and peppers"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-radial from-[hsl(var(--primary))]/20 via-transparent to-transparent opacity-50" 
             style={{ background: 'radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.2) 0%, transparent 60%)' }} />
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.01] mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Content overlay */}
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
              <p className="text-xl text-white/90 sm:text-2xl max-w-2xl leading-relaxed drop-shadow-md">
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
