import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StoryPage() {
  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-[hsl(var(--text-primary))] sm:text-5xl">
              Our Story
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--text-secondary))]">
              Born from a passion for bold flavor and real ingredients
            </p>
          </div>

          <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-border">
              <Image
                src="/images/hero/hero-craftsmanship.png"
                alt="ChiliRig craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
                Crafted with care
              </h2>
              <p className="text-lg text-[hsl(var(--text-secondary))]">
                ChiliRig was born from a simple idea: chili oil should be bold,
                complex, and made with real ingredients. No shortcuts. No
                preservatives. Just premium chilies, slow-infused in quality
                oils, balanced for depth and heat.
              </p>
              <p className="text-[hsl(var(--text-secondary))]">
                Every jar is crafted in small batches using traditional methods
                passed down through generations. We source the finest dried
                chilies, carefully blend them with garlic, Sichuan peppercorns,
                and premium oils, then slow-infuse them to extract maximum
                flavor.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
              Our Small Batch Promise
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                    Real Ingredients
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                    We use premium dried chilies, not extracts. Every ingredient
                    is carefully selected for quality and flavor.
                  </p>
                </CardContent>
              </Card>
              <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                    Slow Infusion
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                    Our chili oil is slow-infused over time, allowing flavors to
                    develop depth and complexity. No shortcuts.
                  </p>
                </CardContent>
              </Card>
              <Card className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                    Small Batches
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                    Every batch is crafted by hand in small quantities,
                    ensuring consistency and quality in every jar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
                From our kitchen to yours
              </h2>
              <p className="text-lg text-[hsl(var(--text-secondary))]">
                We believe great food starts with great ingredients. That's why
                we're committed to sourcing the best chilies, using traditional
                methods, and never compromising on quality.
              </p>
              <p className="text-[hsl(var(--text-secondary))]">
                Whether you're drizzling it on rice, drowning your noodles, or
                dipping your favorite snacks, ChiliRig elevates every bite with
                bold, complex flavor. Join thousands of customers who have made
                ChiliRig a pantry staple.
              </p>
              <Link href="/shop">
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-border order-1 lg:order-2">
              <Image
                src="/images/hero/hero-craftsmanship.png"
                alt="ChiliRig ingredients"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

