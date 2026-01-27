import { NextRequest, NextResponse } from "next/server";
import { reviews, Review } from "@/data/reviews";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all reviews
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const newReview: Review = {
      id: Date.now().toString(),
      name: body.name,
      rating: parseInt(body.rating),
      comment: body.comment,
      date: body.date || new Date().toISOString().split("T")[0],
      verified: body.verified !== false,
    };

    return NextResponse.json({ success: true, data: newReview });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// PUT - Update a review
export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    return NextResponse.json({ success: true, data: { id, ...updates } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
