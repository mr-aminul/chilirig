"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/SectionContainer";

export interface CategoryCardItem {
  category: string;
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
}

interface CategoryCardsProps {
  categories: CategoryCardItem[];
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <SectionContainer background="theme" className="relative overflow-hidden bg-[hsl(var(--primary))]">
      <div className="relative z-10">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Explore Our Collection
          </h2>
          <p className="text-white/90">
            Find your perfect heat level and flavor profile
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="mx-auto h-full w-full max-w-md"
            >
              <Card className="group h-full flex flex-col overflow-hidden border border-white/35 bg-white/12 backdrop-blur-xl transition-all hover:bg-white/18 hover:shadow-xl hover:shadow-black/30">
                <Link href={category.href}>
                  <div className="relative h-56 flex-shrink-0 overflow-hidden border-b border-white/25 bg-black/20">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 448px"
                    />
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="mb-2 font-display text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                  <p className="mb-4 min-h-[2.5rem] flex-grow text-sm text-white/85">
                    {category.description}
                  </p>
                  <Link href={category.href} className="mt-auto">
                    <Button
                      className="w-full border-0 bg-black text-white shadow-lg hover:bg-black/90 hover:shadow-xl"
                    >
                      {category.ctaLabel}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
