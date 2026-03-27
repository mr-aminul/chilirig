import "server-only";

import { HeatLevel, Product } from "@/data/products";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalizeImageUrl } from "@/lib/utils";

function toProduct(row: any): Product {
  const image = normalizeImageUrl(row.image);
  const images: string[] = Array.isArray(row.images)
    ? row.images.map((item: string) => normalizeImageUrl(item))
    : [];
  const galleryImages = [image, ...images.filter((item: string) => item && item !== image)];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    image,
    images: galleryImages.length > 0 ? galleryImages : [image],
    heatLevel: row.heat_level as HeatLevel,
    category: row.category,
    inStock: row.in_stock,
    flavorNotes: row.flavor_notes ?? [],
    ingredients: row.ingredients ?? [],
    nutrition: row.nutrition ?? undefined,
    isBestSeller: row.is_best_seller ?? false,
    isNew: row.is_new ?? false,
    isBundle: row.is_bundle ?? false,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw error;
  }

  return data ? toProduct(data) : null;
}
