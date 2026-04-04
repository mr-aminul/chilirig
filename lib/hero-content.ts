import "server-only";

import { defaultHeroContent, HeroContent, HeroSlide } from "@/data/hero";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { canonicalImageUrlForStorage } from "@/lib/utils";

/** Hero slides as stored in Supabase (canonical image URLs). Admin API and homepage both use this; UI applies `imageSrcForNext` for display. */
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

    return {
      slides: slides.map((slide, index) => ({
        id: String(slide.id ?? `hero-slide-${index + 1}`),
        image: slide.image ?? "",
        alt: slide.alt_text ?? `Hero slide ${index + 1}`,
      })),
    };
  } catch {
    return defaultHeroContent;
  }
}

export async function saveHeroContent(content: HeroContent): Promise<HeroContent> {
  const supabase = getSupabaseAdmin();

  const rows = content.slides
    .filter((slide) => slide.image?.trim())
    .map((slide, index) => ({
      image: canonicalImageUrlForStorage(slide.image.trim()),
      alt_text: slide.alt?.trim() || `Hero slide ${index + 1}`,
      sort_order: index + 1,
    }));

  if (rows.length === 0) {
    throw new Error("At least one hero slide with an image URL is required");
  }

  const { error: deleteError } = await supabase
    .from("hero_slides")
    .delete()
    .gte("sort_order", 0);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("hero_slides").insert(rows);

  if (insertError) {
    throw insertError;
  }

  return getHeroContent();
}
