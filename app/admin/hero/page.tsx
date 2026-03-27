"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Edit,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { HeroContent, HeroSlide } from "@/data/hero";
import { invalidateApiCache } from "@/lib/api-cache";

export default function HeroAdminPage() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await fetch("/api/hero", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setHeroContent(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch hero content:", error);
    } finally {
      setLoading(false);
    }
  };

  const persistSlides = async (slides: HeroSlide[]) => {
    setSaving(true);

    try {
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const result = await response.json();

      if (result.success) {
        setHeroContent(result.data);
        invalidateApiCache("/api/hero");
      } else {
        alert(`Failed to save hero content: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to save hero content:", error);
      alert("Failed to save hero content");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlide = async (slide: HeroSlide) => {
    const slides = heroContent?.slides ?? [];
    const existingIndex = slides.findIndex((item) => item.id === slide.id);
    const nextSlides =
      existingIndex >= 0
        ? slides.map((item) => (item.id === slide.id ? slide : item))
        : [...slides, slide];

    await persistSlides(nextSlides);
    setShowForm(false);
    setEditingSlide(null);
  };

  const handleDelete = async (id: string) => {
    const slides = heroContent?.slides ?? [];
    if (slides.length <= 1) {
      alert("The hero section needs at least one slide.");
      return;
    }

    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    await persistSlides(slides.filter((slide) => slide.id !== id));
  };

  const handleMove = async (id: string, direction: -1 | 1) => {
    const slides = [...(heroContent?.slides ?? [])];
    const index = slides.findIndex((slide) => slide.id === id);
    const targetIndex = index + direction;

    if (index === -1 || targetIndex < 0 || targetIndex >= slides.length) {
      return;
    }

    const [slide] = slides.splice(index, 1);
    slides.splice(targetIndex, 0, slide);
    await persistSlides(slides);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <ImageIcon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">Hero Management</h1>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                View Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold">Homepage Hero Slides</h2>
            <p className="text-muted-foreground">
              Manage the slideshow images shown at the top of the homepage.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading hero content...</p>
          </div>
        ) : !heroContent || heroContent.slides.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hero slides found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {heroContent.slides.map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="relative h-56 bg-muted">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                    Slide {index + 1}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{slide.alt}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="rounded bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                    {slide.image}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingSlide(slide);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleMove(slide.id, -1)}>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Up
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleMove(slide.id, 1)}>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Down
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {saving && (
          <p className="mt-4 text-sm text-muted-foreground">Saving hero content...</p>
        )}
      </main>

      {showForm && (
        <HeroSlideForm
          slide={editingSlide}
          onClose={() => {
            setShowForm(false);
            setEditingSlide(null);
          }}
          onSave={handleSaveSlide}
        />
      )}
    </div>
  );
}
