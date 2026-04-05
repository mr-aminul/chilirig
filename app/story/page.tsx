"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, Layers, Leaf } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StoryPageContent, StoryPromiseIcon } from "@/data/story";
import { fetchApiJson, withCacheBust } from "@/lib/fetch-api";
import { imageSrcForNext } from "@/lib/media-url";

function PromiseIcon({ icon }: { icon: StoryPromiseIcon }) {
  const className = "h-6 w-6 text-crimson-600";
  if (icon === "leaf") return <Leaf className={className} aria-hidden />;
  if (icon === "flame") return <Flame className={className} aria-hidden />;
  return <Layers className={className} aria-hidden />;
}

function SectionImage({
  imageUrl,
  fetchPriority,
}: {
  imageUrl: string;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const trimmed = imageUrl.trim();
  const src = trimmed ? imageSrcForNext(imageUrl) : "";
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avoid next/image optimizer merging same-origin proxy URLs
        <img
          key={src}
          src={src}
          alt=""
          fetchPriority={fetchPriority}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
          aria-hidden
        />
      )}
    </div>
  );
}

function CtaLink({ label, href }: { label: string; href: string }) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button size="lg" className="min-w-[200px] px-10">
          {label}
        </Button>
      </a>
    );
  }
  return (
    <Link href={href}>
      <Button size="lg" className="min-w-[200px] px-10">
        {label}
      </Button>
    </Link>
  );
}

export default function StoryPage() {
  const [content, setContent] = useState<StoryPageContent | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchApiJson<{
          success: boolean;
          data?: StoryPageContent | null;
        }>(withCacheBust("/api/story"));
        if (!result.success) {
          setPhase("error");
          return;
        }
        if (result.data) {
          setContent(result.data);
          setPhase("ready");
        } else {
          setPhase("empty");
        }
      } catch {
        setPhase("error");
      }
    };
    void load();
  }, []);

  if (phase === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-[50vh] bg-white pt-24">
          <SectionContainer>
            <p className="text-center text-gray-600">Loading…</p>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  if (phase === "empty" || phase === "error") {
    return (
      <>
        <Header />
        <main className="min-h-[50vh] bg-white pt-24">
          <SectionContainer>
            <div className="mx-auto max-w-lg text-center">
              <h1 className="mb-4 font-display text-3xl font-bold text-gray-900">Our Story</h1>
              <p className="mb-6 text-gray-600">
                {phase === "error"
                  ? "We could not load this page. Please try again in a moment."
                  : "This page has not been published yet. Check back soon."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/">
                  <Button variant="outline">Home</Button>
                </Link>
                <Link href="/shop">
                  <Button>Shop</Button>
                </Link>
              </div>
            </div>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  if (!content) {
    return (
      <>
        <Header />
        <main className="min-h-[50vh] bg-white pt-24">
          <SectionContainer>
            <p className="text-center text-gray-600">Something went wrong loading this page.</p>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-white pt-24">
        <SectionContainer>
          <header className="mb-16 text-center sm:mb-20">
            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">{content.heroSubtitle}</p>
          </header>

          <section className="mb-20 grid items-center gap-10 lg:mb-28 lg:grid-cols-2 lg:gap-16">
            <SectionImage imageUrl={content.section1.imageUrl} fetchPriority="high" />
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
                {content.section1.heading}
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 whitespace-pre-line">{content.section1.body}</p>
            </div>
          </section>

          <section className="mb-20 lg:mb-28">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-gray-900 sm:mb-12 sm:text-4xl">
              Our Small Batch Promise
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {content.promises.map((card, index) => (
                <Card
                  key={index}
                  className="border border-gray-100 bg-white shadow-md shadow-black/[0.04]"
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-crimson-50">
                      <PromiseIcon icon={card.icon} />
                    </div>
                    <h3 className="mb-3 font-display text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{card.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-20 grid items-center gap-10 lg:mb-28 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 space-y-4 lg:order-1">
              <h2 className="font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
                {content.section2.heading}
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 whitespace-pre-line">{content.section2.body}</p>
            </div>
            <div className="order-1 lg:order-2">
              <SectionImage imageUrl={content.section2.imageUrl} fetchPriority="low" />
            </div>
          </section>

          <div className="flex justify-center pb-8">
            <CtaLink label={content.cta.label} href={content.cta.href} />
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
