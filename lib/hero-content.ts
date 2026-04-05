import "server-only";

import { HeroContent, HeroSlide } from "@/data/hero";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { canonicalImageUrlForStorage } from "@/lib/utils";

const HERO_TABLE = "hero_home_images";

/** Always three slots; empty strings allowed in DB. */
export async function getHeroAdminImages(): Promise<[string, string, string]> {
  const supabase = getSupabaseAdmin();
  // SECURITY DEFINER RPC returns rows regardless of RLS / key mixups on direct table reads.
  const { data, error } = await supabase.rpc("list_hero_home_images");

  if (error) throw error;

  const out: [string, string, string] = ["", "", ""];
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const slotRaw = r.slot ?? r.Slot;
    const slot = Number(slotRaw);
    const urlRaw = r.image_url ?? r.imageUrl;
    const url = typeof urlRaw === "string" ? urlRaw : urlRaw != null ? String(urlRaw) : "";
    if (slot >= 1 && slot <= 3 && Number.isFinite(slot)) {
      out[slot - 1] = url;
    }
  }
  return out;
}

/** Slides for <Hero /> — only slots with a non-empty image URL. */
export async function getHeroContent(): Promise<HeroContent> {
  const [a, b, c] = await getHeroAdminImages();
  const slides: HeroSlide[] = [];
  const triple: [string, string, string] = [a, b, c];
  for (let i = 0; i < 3; i++) {
    const raw = triple[i].trim();
    if (!raw) continue;
    const image = canonicalImageUrlForStorage(raw);
    if (!image.trim()) continue;
    slides.push({
      id: `hero-slot-${i + 1}`,
      image,
      alt: `Hero image ${i + 1}`,
    });
  }
  return { slides };
}

export async function saveHeroAdminImages(urls: [string, string, string]): Promise<void> {
  const supabase = getSupabaseAdmin();
  const rows = urls.map((url, index) => ({
    slot: index + 1,
    image_url: canonicalImageUrlForStorage((url ?? "").trim()),
  }));

  const { error } = await supabase.from(HERO_TABLE).upsert(rows, { onConflict: "slot" });

  if (error) throw error;
}
