import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";
import { recipes } from "@/data/recipes";

export default function RecipesPage() {
  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
              Recipes
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover new ways to enjoy ChiliRig in your favorite dishes
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:shadow-crimson-900/10">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-display text-xl font-semibold text-gray-900 transition-colors group-hover:text-crimson-600">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{recipe.prepTime}</span>
                      <span>•</span>
                      <span>{recipe.cookTime}</span>
                      <span>•</span>
                      <span>{recipe.servings} servings</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

