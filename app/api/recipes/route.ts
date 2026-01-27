import { NextRequest, NextResponse } from "next/server";
import { recipes, Recipe } from "@/data/recipes";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all recipes
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: recipes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST - Create a new recipe
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      image: body.image,
      prepTime: body.prepTime,
      cookTime: body.cookTime,
      servings: parseInt(body.servings),
      heatLevel: parseInt(body.heatLevel),
      ingredients: body.ingredients || [],
      steps: body.steps || [],
      tips: body.tips || [],
    };

    return NextResponse.json({ success: true, data: newRecipe });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

// PUT - Update a recipe
export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    return NextResponse.json({ success: true, data: { id, ...updates } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recipe
export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
