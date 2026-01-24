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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <CategoryCards />
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
