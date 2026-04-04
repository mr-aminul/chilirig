import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StorySection } from "@/data/story";
import { getStoryContent } from "@/lib/story-content";
import { imageSrcForNext } from "@/lib/media-url";
import { Leaf, Package, Timer, type LucideIcon } from "lucide-react";

const PROMISE_ICONS: LucideIcon[] = [Leaf, Timer, Package];

function renderSection(section: StorySection) {
  switch (section.type) {
    case "hero":
      return (
        <div key={section.id} className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div
            className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-gray-100 lg:mx-0 lg:max-w-lg ${
              section.imagePosition === "right" ? "order-2" : ""
            }`}
          >
            {section.image && (
              <Image
                src={imageSrcForNext(section.image)}
                alt={section.imageAlt || ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          <div
            className={`space-y-6 ${
              section.imagePosition === "right" ? "lg:pr-6" : "lg:pl-6"
            }`}
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
              {section.promises.map((promise, index) => {
                const Icon = PROMISE_ICONS[index % PROMISE_ICONS.length];
                return (
                  <Card
                    key={promise.id}
                    className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-2 font-display text-lg font-semibold leading-snug text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white sm:text-xl">
                            {promise.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90">
                            {promise.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      );

    case "content":
      return (
        <div key={section.id} className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div
            className={`space-y-6 lg:pr-6 ${section.imagePosition === "right" ? "order-2 lg:order-1" : "order-2 lg:order-1"}`}
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
              <Link href={section.ctaLink} className="inline-block pt-2">
                <Button size="lg">{section.ctaText}</Button>
              </Link>
            )}
          </div>
          {section.image && (
            <div
              className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-gray-100 lg:mx-0 lg:max-w-lg ${
                section.imagePosition === "right" ? "order-1 lg:order-2" : "order-1 lg:order-2"
              }`}
            >
              <Image
                src={imageSrcForNext(section.image)}
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

export default async function StoryPage() {
  const story = await getStoryContent();

  if (!story) {
    return (
      <>
        <Header />
        <main>
          <SectionContainer>
            <p className="text-[hsl(var(--text-secondary))]">
              We couldn&apos;t load this page right now. Please try again in a moment.
            </p>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

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
