"use client";

import { motion } from "framer-motion";
import { Droplet, UtensilsCrossed, Hand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/SectionContainer";

const steps = [
  {
    icon: Droplet,
    title: "Drizzle",
    description: "Rice, dumplings, eggs. A few drops transform simple dishes into flavor explosions.",
    examples: ["Steamed rice", "Dumplings", "Fried eggs"],
  },
  {
    icon: UtensilsCrossed,
    title: "Drown",
    description: "Noodles, ramen, pasta. Mix it in for bold, saucy dishes that pack a punch.",
    examples: ["Ramen", "Pasta", "Stir-fry noodles"],
  },
  {
    icon: Hand,
    title: "Dip",
    description: "Pizza, fries, snacks. The perfect condiment for dipping and dunking.",
    examples: ["Pizza crust", "French fries", "Spring rolls"],
  },
];

export function HowToEnjoy() {
  return (
    <SectionContainer background="light">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          How to Enjoy
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          The right solution for bold flavor in every bite
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-[hsl(var(--primary))] p-4 shadow-lg shadow-[hsl(var(--primary))]/30 transition-all duration-300 group-hover:!bg-white group-hover:!shadow-white/30">
                  <step.icon className="h-6 w-6 text-white transition-colors duration-300 group-hover:!text-[hsl(var(--primary))]" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                  {step.title}
                </h3>
                <p className="mb-4 text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                  {step.description}
                </p>
                <ul className="space-y-1 text-xs text-[hsl(var(--text-muted))] transition-colors duration-300 group-hover:!text-white/80">
                  {step.examples.map((example) => (
                    <li key={example} className="flex items-center">
                      <span className="mr-2 text-[hsl(var(--primary))] transition-colors duration-300 group-hover:!text-white">•</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
