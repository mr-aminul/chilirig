"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/SectionContainer";
import { recipes } from "@/data/recipes";

const featuredRecipes = recipes.slice(0, 3);

export function RecipeTeaser() {
  return (
    <SectionContainer>
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
          Featured Recipes
        </h2>
        <p className="text-[hsl(var(--text-secondary))]">
          Discover new ways to enjoy ChiliRig
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {featuredRecipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/recipes/${recipe.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:shadow-black/10">
                <div className="relative h-48 overflow-hidden bg-gray-100 border-b border-black/10">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors group-hover:text-[hsl(var(--primary))]">
                    {recipe.title}
                  </h3>
                  <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
                    <span>{recipe.prepTime}</span>
                    <span>•</span>
                    <span>{recipe.cookTime}</span>
                    <span>•</span>
                    <span>{recipe.servings} servings</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/recipes">
          <button className="text-[hsl(var(--primary))] transition-colors hover:text-[hsl(var(--primary-hover))] font-medium">
            View All Recipes →
          </button>
        </Link>
      </div>
    </SectionContainer>
  );
}
