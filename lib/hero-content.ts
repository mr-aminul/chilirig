import "server-only";

import { defaultHeroContent, HeroContent, HeroSlide } from "@/data/hero";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalizeImageUrl } from "@/lib/utils";

function normalizeHeroContent(content: Partial<HeroContent> | null | undefined): HeroContent {
  const slides = Array.isArray(content?.slides) ? content.slides : defaultHeroContent.slides;

  return {
    slides: slides
      .filter((slide): slide is HeroSlide => Boolean(slide?.image))
      .map((slide, index) => ({
        id: slide.id || `hero-slide-${index + 1}`,
        image: normalizeImageUrl(slide.image),
        alt: slide.alt?.trim() || `Hero slide ${index + 1}`,
      })),
  };
}

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: slides, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    if (!slides || slides.length === 0) {
      return defaultHeroContent;
    }

    return normalizeHeroContent({
      slides: slides.map((slide, index) => ({
        id: String(slide.id ?? `hero-slide-${index + 1}`),
        image: slide.image ?? "",
        alt: slide.alt_text ?? `Hero slide ${index + 1}`,
      })),
    });
  } catch {
    return defaultHeroContent;
  }
}

export async function saveHeroContent(content: HeroContent): Promise<HeroContent> {
  const normalized = normalizeHeroContent(content);
  const supabase = getSupabaseAdmin();

  const { error: deleteError } = await supabase
    .from("hero_slides")
    .delete()
    .gte("sort_order", 0);

  if (deleteError) {
    throw deleteError;
  }

  const rows = normalized.slides.map((slide, index) => ({
    image: slide.image,
    alt_text: slide.alt,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase.from("hero_slides").insert(rows);

  if (insertError) {
    throw insertError;
  }

  return getHeroContent();
}
