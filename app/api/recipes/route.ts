import { NextRequest, NextResponse } from "next/server";
import { Recipe } from "@/data/recipes";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

function toRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    image: row.image,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    heatLevel: row.heat_level,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    tips: row.tips ?? [],
  };
}

// GET - Fetch all recipes
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json(
      { success: true, data: (data ?? []).map(toRecipe) },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipes" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

// POST - Create a new recipe
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const parsedHeatLevel = parseInt(body.heatLevel);
    let heatLevel: 1 | 2 | 3 | 4 | 5 = 3;
    if (parsedHeatLevel === 1 || parsedHeatLevel === 2 || parsedHeatLevel === 3 || parsedHeatLevel === 4 || parsedHeatLevel === 5) {
      heatLevel = parsedHeatLevel;
    }

    const insertPayload = {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      image: body.image,
      prep_time: body.prepTime,
      cook_time: body.cookTime,
      servings: parseInt(body.servings) || 1,
      heat_level: heatLevel,
      ingredients: body.ingredients || [],
      steps: body.steps || [],
      tips: body.tips || [],
    };

    const { data, error } = await supabase
      .from("recipes")
      .insert(insertPayload)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: toRecipe(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

// PUT - Update a recipe
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const parsedHeatLevel = updates.heatLevel != null ? parseInt(updates.heatLevel) : null;
    const updatePayload: Record<string, any> = {
      ...(updates.title != null && { title: updates.title }),
      ...(updates.slug != null && { slug: updates.slug }),
      ...(updates.description != null && { description: updates.description }),
      ...(updates.image != null && { image: updates.image }),
      ...(updates.prepTime != null && { prep_time: updates.prepTime }),
      ...(updates.cookTime != null && { cook_time: updates.cookTime }),
      ...(updates.servings != null && { servings: parseInt(updates.servings) || 1 }),
      ...(parsedHeatLevel != null &&
      (parsedHeatLevel === 1 ||
        parsedHeatLevel === 2 ||
        parsedHeatLevel === 3 ||
        parsedHeatLevel === 4 ||
        parsedHeatLevel === 5)
        ? { heat_level: parsedHeatLevel }
        : {}),
      ...(updates.ingredients != null && { ingredients: updates.ingredients }),
      ...(updates.steps != null && { steps: updates.steps }),
      ...(updates.tips != null && { tips: updates.tips }),
    };

    const { data, error } = await supabase
      .from("recipes")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: toRecipe(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recipe
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
