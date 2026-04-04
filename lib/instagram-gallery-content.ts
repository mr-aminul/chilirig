import "server-only";

import {
  defaultInstagramGalleryContent,
  DEFAULT_INSTAGRAM_PROFILE_URL,
  InstagramGalleryContent,
  InstagramGalleryTile,
} from "@/data/instagram-gallery";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { canonicalImageUrlForStorage } from "@/lib/utils";

function mapTile(row: {
  id: string;
  image: string;
  alt_text: string | null;
  link_url: string | null;
}, index: number): InstagramGalleryTile {
  return {
    id: String(row.id ?? `ig-tile-${index + 1}`),
    image: row.image ?? "",
    alt: row.alt_text?.trim() || `Instagram post ${index + 1}`,
    href: row.link_url?.trim() || DEFAULT_INSTAGRAM_PROFILE_URL,
  };
}

export async function getInstagramGalleryContent(): Promise<InstagramGalleryContent> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: settingsRow, error: settingsError } = await supabase
      .from("instagram_gallery_settings")
      .select("heading, subheading")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) {
      throw settingsError;
    }

    const { data: tileRows, error: tilesError } = await supabase
      .from("instagram_gallery_tiles")
      .select("id, image, alt_text, link_url, sort_order")
      .order("sort_order", { ascending: true });

    if (tilesError) {
      throw tilesError;
    }

    if (!tileRows || tileRows.length === 0) {
      return {
        heading: settingsRow?.heading?.trim() || defaultInstagramGalleryContent.heading,
        subheading: settingsRow?.subheading?.trim() || defaultInstagramGalleryContent.subheading,
        tiles: defaultInstagramGalleryContent.tiles,
      };
    }

    return {
      heading: settingsRow?.heading?.trim() || defaultInstagramGalleryContent.heading,
      subheading: settingsRow?.subheading?.trim() || defaultInstagramGalleryContent.subheading,
      tiles: tileRows.map((row, index) => mapTile(row, index)),
    };
  } catch {
    return defaultInstagramGalleryContent;
  }
}

export async function saveInstagramGalleryContent(
  content: InstagramGalleryContent
): Promise<InstagramGalleryContent> {
  const supabase = getSupabaseAdmin();

  const heading = content.heading?.trim() || defaultInstagramGalleryContent.heading;
  const subheading = content.subheading?.trim() || defaultInstagramGalleryContent.subheading;

  const rows = content.tiles
    .filter((tile) => tile.image?.trim())
    .map((tile, index) => ({
      image: canonicalImageUrlForStorage(tile.image.trim()),
      alt_text: tile.alt?.trim() || `Instagram post ${index + 1}`,
      link_url: tile.href?.trim() || null,
      sort_order: index + 1,
    }));

  if (rows.length === 0) {
    throw new Error("At least one tile with an image URL is required");
  }

  const { error: settingsError } = await supabase.from("instagram_gallery_settings").upsert(
    { id: 1, heading, subheading, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );

  if (settingsError) {
    throw settingsError;
  }

  const { error: deleteError } = await supabase
    .from("instagram_gallery_tiles")
    .delete()
    .gte("sort_order", 0);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("instagram_gallery_tiles").insert(rows);

  if (insertError) {
    throw insertError;
  }

  return getInstagramGalleryContent();
}
