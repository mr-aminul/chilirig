"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { ReviewCard } from "@/components/ReviewCard";
import { SectionContainer } from "@/components/SectionContainer";
import { getAverageRating, getFeaturedReviews } from "@/data/reviews";

export function SocialProof() {
  const averageRating = getAverageRating();
  const featuredReviews = getFeaturedReviews(3);

  return (
    <SectionContainer background="light">
      <div className="mb-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xl font-bold text-[hsl(var(--text-primary))]">
            {averageRating.toFixed(1)}
          </span>
        </div>
        <p className="text-[hsl(var(--text-secondary))]">
          Join thousands of satisfied customers
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {featuredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
