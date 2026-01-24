"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/SectionContainer";

export function FeaturedBanner() {
  return (
    <SectionContainer background="dark">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl lg:text-5xl">
            Grow your cravings. Feed your fire.
          </h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            Every jar of ChiliRig is crafted in small batches using traditional
            methods. We source premium chilies, slow-infuse them in quality
            oils, and balance heat with depth. No shortcuts. No preservatives.
            Just real ingredients, real flavor.
          </p>
          <p className="text-[hsl(var(--text-secondary))]">
            Our commitment to craftsmanship means every drop delivers complex,
            layered flavor. Whether you're drizzling it on rice, drowning your
            noodles, or dipping your favorite snacks, ChiliRig elevates every
            bite.
          </p>
          <Link href="/story">
            <Button size="lg" variant="default">
              Read Our Story
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-square max-w-lg mx-auto lg:mx-0"
        >
          <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-100 border border-black/10 shadow-2xl">
            <Image
              src="/images/hero/hero-craftsmanship.png"
              alt="ChiliRig craftsmanship"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
