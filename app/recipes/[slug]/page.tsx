import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";
import { HeatMeter } from "@/components/HeatMeter";
import { Button } from "@/components/ui/button";
import { getRecipeBySlug } from "@/data/recipes";
import { Clock, Users } from "lucide-react";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

export default function RecipePage({ params }: RecipePageProps) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-8">
            <Link
              href="/recipes"
              className="text-sm text-crimson-600 transition-colors hover:text-crimson-700"
            >
              ← Back to Recipes
            </Link>
          </div>

          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
                  {recipe.title}
                </h1>
                <p className="mb-6 text-lg text-gray-600">
                  {recipe.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Prep</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {recipe.prepTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Cook</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {recipe.cookTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Serves</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {recipe.servings}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                  <div>
                    <div className="text-xs text-gray-500">Heat</div>
                    <HeatMeter level={recipe.heatLevel} size="sm" showLabel={false} />
                  </div>
                </div>
              </div>

              <Link href="/shop">
                <Button size="lg">Shop ChiliRig</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 font-display text-2xl font-semibold text-gray-900">
                  Ingredients
                </h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-crimson-50 text-xs font-semibold text-crimson-600">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ingredient.name}
                      </span>
                      <span className="ml-auto text-gray-500">
                        {ingredient.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 font-display text-2xl font-semibold text-gray-900">
                  Instructions
                </h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step) => (
                    <li
                      key={step.step}
                      className="flex gap-4 text-sm text-gray-600"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson-gradient text-sm font-bold text-white">
                        {step.step}
                      </span>
                      <span className="pt-1">{step.instruction}</span>
                    </li>
                  ))}
                </ol>
                {recipe.tips && recipe.tips.length > 0 && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Tips
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-crimson-600">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
