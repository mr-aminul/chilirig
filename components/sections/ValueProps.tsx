"use client";

import { motion } from "framer-motion";
import { Flame, Leaf, Zap, Truck } from "lucide-react";
import { SectionContainer } from "@/components/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";

const valueProps = [
  {
    icon: Flame,
    title: "Real chillies, slow infused",
    description: "We use premium dried chilies, not extracts. Slow-infused for maximum flavor depth.",
  },
  {
    icon: Leaf,
    title: "Umami rich, never greasy",
    description: "Perfect balance of oil and solids. Rich flavor without the heavy, greasy feel.",
  },
  {
    icon: Zap,
    title: "Heat levels for every palate",
    description: "From mild to extreme, find your perfect heat level. All with complex, layered flavor.",
  },
  {
    icon: Truck,
    title: "Fresh at your door",
    description:
      "Delivery takes approximately 3–5 business days. Free shipping on orders over ৳1,500.",
  },
];

export function ValueProps() {
  return (
    <SectionContainer>
      <div className="mb-8 text-center sm:mb-12">
        <h2 className="mb-3 font-display text-2xl font-bold text-[hsl(var(--text-primary))] sm:mb-4 sm:text-3xl md:text-4xl">
          Our Small Batch Promise
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] sm:text-base">
          Crafted with care, delivered with passion
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        {valueProps.map((prop, index) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
              <CardContent className="p-4 text-center sm:p-6">
                <div className="mb-3 inline-flex rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 p-3 transition-all duration-300 group-hover:!bg-white/20 group-hover:!border-white/30 sm:mb-4 sm:p-4">
                  <prop.icon className="h-5 w-5 text-[hsl(var(--primary))] transition-colors duration-300 group-hover:!text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-1.5 font-display text-base font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white sm:mb-2 sm:text-lg">
                  {prop.title}
                </h3>
                <p className="text-xs leading-snug text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90 sm:text-sm sm:leading-normal">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
