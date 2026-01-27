import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { storyContent, StorySection } from "@/data/story";

function renderSection(section: StorySection) {
  switch (section.type) {
    case "hero":
      return (
        <div key={section.id} className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div
            className={`relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-border ${
              section.imagePosition === "right" ? "order-2" : ""
            }`}
          >
            {section.image && (
              <Image
                src={section.image}
                alt={section.imageAlt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          <div className="space-y-6">
            {section.title && (
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description &&
              section.description.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-lg text-[hsl(var(--text-secondary))]">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      );

    case "promises":
      return (
        <div key={section.id} className="mb-16">
          {section.title && (
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
              {section.title}
            </h2>
          )}
          {section.promises && section.promises.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {section.promises.map((promise) => (
                <Card
                  key={promise.id}
                  className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20"
                >
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white">
                      {promise.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                      {promise.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );

    case "content":
      return (
        <div key={section.id} className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div
            className={`space-y-6 ${section.imagePosition === "right" ? "order-2 lg:order-1" : "order-2 lg:order-1"}`}
          >
            {section.title && (
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description &&
              section.description.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-lg text-[hsl(var(--text-secondary))]">
                  {paragraph}
                </p>
              ))}
            {section.ctaText && section.ctaLink && (
              <Link href={section.ctaLink}>
                <Button size="lg">{section.ctaText}</Button>
              </Link>
            )}
          </div>
          {section.image && (
            <div
              className={`relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-border ${
                section.imagePosition === "right" ? "order-1 lg:order-2" : "order-1 lg:order-2"
              }`}
            >
              <Image
                src={section.image}
                alt={section.imageAlt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      );

    case "cta":
      return (
        <div key={section.id} className="mb-16 text-center">
          {section.ctaText && section.ctaLink && (
            <Link href={section.ctaLink}>
              <Button size="lg">{section.ctaText}</Button>
            </Link>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default function StoryPage() {
  const story = storyContent;
  const sortedSections = [...story.sections].sort((a, b) => a.order - b.order);

  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-[hsl(var(--text-primary))] sm:text-5xl">
              {story.pageTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--text-secondary))]">
              {story.pageSubtitle}
            </p>
          </div>

          {sortedSections.map((section) => renderSection(section))}
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

