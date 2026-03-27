import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { CategoryCards } from "@/components/sections/CategoryCards";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { HowToEnjoy } from "@/components/sections/HowToEnjoy";
import { FeaturedBanner } from "@/components/sections/FeaturedBanner";
import { RecipeTeaser } from "@/components/sections/RecipeTeaser";
import { SocialProof } from "@/components/sections/SocialProof";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { Newsletter } from "@/components/sections/Newsletter";
import { HomePrefetch } from "@/components/HomePrefetch";
import { Product } from "@/data/products";
import { defaultHeroContent } from "@/data/hero";
import { getHeroContent } from "@/lib/hero-content";
import { getProducts } from "@/lib/products-db";

function getCategoryTitle(category: string, representative: Product): string {
  if (category === "gift-set") {
    return "Gift Sets";
  }

  return representative.name.replace(/\s+Chili Oil$/i, "").trim();
}

function getCategoryDescription(representative: Product): string {
  const firstSentence = representative.description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return firstSentence && firstSentence.length > 0
    ? firstSentence
    : representative.description.trim();
}

function buildCategoryCards(products: Product[]) {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const existing = groups.get(product.category) ?? [];
    existing.push(product);
    groups.set(product.category, existing);
  }

  const preferredOrder = ["original", "beef"];

  return [...groups.entries()]
    .filter(([, items]) => items.some((item) => item.isBundle !== true))
    .sort(([left], [right]) => {
      const leftIndex = preferredOrder.indexOf(left);
      const rightIndex = preferredOrder.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    })
    .map(([category, items]) => {
      const representative =
        items.find((item) => item.slug.includes(category)) ??
        items.find((item) => item.isBestSeller === true) ??
        items[0];
      const title = getCategoryTitle(category, representative);

      return {
        category,
        title,
        description: getCategoryDescription(representative),
        image: representative.image,
        href: `/shop?category=${category}`,
        ctaLabel: `Shop ${title}`,
      };
    });
}

export default async function Home() {
  let heroSlides = defaultHeroContent.slides;
  let categories = [];

  try {
    const heroContent = await getHeroContent();
    heroSlides = heroContent.slides;
  } catch (error) {
    console.error("Failed to load hero content:", error);
  }

  try {
    const products = await getProducts();
    categories = buildCategoryCards(products);
  } catch (error) {
    console.error("Failed to load collection cards:", error);
  }

  return (
    <>
      <Header />
      <HomePrefetch />
      <main className="home-sections">
        <Hero slides={heroSlides} />
        <ValueProps />
        <CategoryCards categories={categories} />
        <ProductGrid />
        <HowToEnjoy />
        <FeaturedBanner />
        <RecipeTeaser />
        <SocialProof />
        <InstagramGallery />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
