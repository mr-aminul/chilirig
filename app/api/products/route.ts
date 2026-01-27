import { NextRequest, NextResponse } from "next/server";
import { products, Product } from "@/data/products";
import { requireAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "products.ts");

// GET - Fetch all products
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      image: body.image,
      images: body.images || [body.image],
      heatLevel: parseInt(body.heatLevel),
      category: body.category,
      inStock: body.inStock !== false,
      flavorNotes: body.flavorNotes || [],
      ingredients: body.ingredients || [],
      nutrition: body.nutrition,
    };

    // In a real app, you'd save to a database
    // For now, we'll return the new product
    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // In a real app, you'd update in a database
    return NextResponse.json({ success: true, data: { id, ...updates } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // In a real app, you'd delete from a database
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
