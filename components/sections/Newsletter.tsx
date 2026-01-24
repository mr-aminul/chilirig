"use client";

import { motion } from "framer-motion";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SectionContainer } from "@/components/SectionContainer";

export function Newsletter() {
  return (
    <SectionContainer background="dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          Stay in the loop
        </h2>
        <p className="mb-8 text-lg text-[hsl(var(--text-secondary))]">
          Get spicy drops, new recipes, and exclusive offers delivered to your
          inbox.
        </p>
        <NewsletterForm />
      </motion.div>
    </SectionContainer>
  );
}
