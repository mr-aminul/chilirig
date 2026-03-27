import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Product, HeatLevel } from "@/data/products";
import { requireAuth } from "@/lib/auth";
import { generateSlug, normalizeImageUrl } from "@/lib/utils";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.union([z.number(), z.string()]),
  originalPrice: z.union([z.number(), z.string()]).optional().nullable(),
  image: z.string().min(1),
  images: z.array(z.string()).optional(),
  heatLevel: z.union([z.number(), z.string()]),
  category: z.string().min(1),
  inStock: z.boolean().optional(),
  flavorNotes: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  nutrition: z.any().optional(),
  isBestSeller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBundle: z.boolean().optional(),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1),
});

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

// GET - Fetch all products (or one by slug)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data: toProduct(data) });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: (data ?? []).map(toProduct) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const parsed = productCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid product payload" },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const parsedHeatLevel = parseInt(String(body.heatLevel), 10);
    const image = normalizeImageUrl(body.image);
    const images: string[] =
      (body.images && body.images.length > 0 ? body.images : [body.image])
        .map((item: string) => normalizeImageUrl(item))
        .filter((item: string) => Boolean(item));
    const galleryImages = [image, ...images.filter((item: string) => item !== image)];
    let heatLevel: HeatLevel = 3;
    if (parsedHeatLevel === 1 || parsedHeatLevel === 2 || parsedHeatLevel === 3 || parsedHeatLevel === 4 || parsedHeatLevel === 5) {
      heatLevel = parsedHeatLevel;
    }

    const insertPayload = {
      name: body.name,
      slug: generateSlug(body.name),
      description: body.description,
      price: parseFloat(String(body.price)),
      original_price: body.originalPrice ? parseFloat(String(body.originalPrice)) : null,
      image,
      images: galleryImages.length > 0 ? galleryImages : [image],
      heat_level: heatLevel,
      category: body.category,
      in_stock: body.inStock !== false,
      flavor_notes: body.flavorNotes || [],
      ingredients: body.ingredients || [],
      nutrition: body.nutrition,
      is_best_seller: body.isBestSeller === true,
      is_new: body.isNew === true,
      is_bundle: body.isBundle === true,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: toProduct(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const parsed = productUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid product update payload" },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const parsedHeatLevel =
      updates.heatLevel != null ? parseInt(String(updates.heatLevel), 10) : null;
    const normalizedImage =
      updates.image != null ? normalizeImageUrl(updates.image) : null;
    const normalizedImages =
      updates.images != null
        ? updates.images
            .map((item: string) => normalizeImageUrl(item))
            .filter((item: string) => Boolean(item))
        : null;
    const galleryImages =
      normalizedImages != null && normalizedImage != null
        ? [normalizedImage, ...normalizedImages.filter((item: string) => item !== normalizedImage)]
        : normalizedImages;
    const updatePayload: Record<string, any> = {
      ...(updates.name != null && { name: updates.name }),
      ...(updates.name != null && { slug: generateSlug(updates.name) }),
      ...(updates.description != null && { description: updates.description }),
      ...(updates.price != null && { price: parseFloat(String(updates.price)) }),
      ...(updates.originalPrice !== undefined && {
        original_price: updates.originalPrice
          ? parseFloat(String(updates.originalPrice))
          : null,
      }),
      ...(normalizedImage != null && { image: normalizedImage }),
      ...(galleryImages != null && { images: galleryImages }),
      ...(parsedHeatLevel != null &&
      (parsedHeatLevel === 1 ||
        parsedHeatLevel === 2 ||
        parsedHeatLevel === 3 ||
        parsedHeatLevel === 4 ||
        parsedHeatLevel === 5)
        ? { heat_level: parsedHeatLevel }
        : {}),
      ...(updates.category != null && { category: updates.category }),
      ...(updates.inStock != null && { in_stock: updates.inStock }),
      ...(updates.flavorNotes != null && { flavor_notes: updates.flavorNotes }),
      ...(updates.ingredients != null && { ingredients: updates.ingredients }),
      ...(updates.nutrition !== undefined && { nutrition: updates.nutrition }),
      ...(updates.isBestSeller != null && { is_best_seller: updates.isBestSeller }),
      ...(updates.isNew != null && { is_new: updates.isNew }),
      ...(updates.isBundle != null && { is_bundle: updates.isBundle }),
    };

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: toProduct(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
