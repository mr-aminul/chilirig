import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/data/reviews";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

function toReview(row: any): Review {
  const isoDate =
    row.review_date instanceof Date
      ? row.review_date.toISOString().split("T")[0]
      : String(row.review_date ?? "");
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    date: isoDate,
    verified: row.verified ?? false,
  };
}

// GET - Fetch all reviews
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("review_date", { ascending: false });
    if (error) throw error;
    return NextResponse.json(
      { success: true, data: (data ?? []).map(toReview) },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const insertPayload = {
      name: body.name,
      rating: parseInt(body.rating),
      comment: body.comment,
      review_date: body.date || new Date().toISOString().split("T")[0],
      verified: body.verified !== false,
      approved: true,
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert(insertPayload)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: toReview(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// PUT - Update a review
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      ...(updates.name != null && { name: updates.name }),
      ...(updates.rating != null && { rating: parseInt(updates.rating) }),
      ...(updates.comment != null && { comment: updates.comment }),
      ...(updates.date != null && { review_date: updates.date }),
      ...(updates.verified != null && { verified: updates.verified }),
    };

    const { data, error } = await supabase
      .from("reviews")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: toReview(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
