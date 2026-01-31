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
    title: "Fast delivery",
    description: "Ships within 24 hours. Free shipping on orders over ৳5,000. Fresh to your door.",
  },
];

export function ValueProps() {
  return (
    <SectionContainer>
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          Our Small Batch Promise
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          Crafted with care, delivered with passion
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop, index) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 p-4 transition-all duration-300 group-hover:!bg-white/20 group-hover:!border-white/30">
                  <prop.icon className="h-6 w-6 text-[hsl(var(--primary))] transition-colors duration-300 group-hover:!text-white" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                  {prop.title}
                </h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
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
