import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { canonicalImageUrlForStorage } from "@/lib/utils";

const TABLE = "featured_banner_section";

export async function getFeaturedBannerImageUrl(): Promise<string> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(TABLE)
      .select("image_url")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const raw = typeof data?.image_url === "string" ? data.image_url.trim() : "";
    return raw ? canonicalImageUrlForStorage(raw) : "";
  } catch {
    return "";
  }
}

export async function saveFeaturedBannerImageUrl(url: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const image_url = canonicalImageUrlForStorage(url.trim());

  const { error } = await supabase.from(TABLE).upsert(
    { id: 1, image_url, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }

  return getFeaturedBannerImageUrl();
}
