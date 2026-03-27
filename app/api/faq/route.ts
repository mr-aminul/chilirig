import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

type FAQQuestion = { id: string; question: string; answer: string };
type FAQCategoryResponse = { id: string; category: string; questions: FAQQuestion[] };

async function getFAQTree(): Promise<FAQCategoryResponse[]> {
  const supabase = getSupabaseAdmin();
  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("faq_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("faq_items").select("*").order("sort_order", { ascending: true }),
    ]);

  if (categoriesError) throw categoriesError;
  if (itemsError) throw itemsError;

  const questionMap = new Map<string, FAQQuestion[]>();
  for (const item of items ?? []) {
    const list = questionMap.get(item.category_id) ?? [];
    list.push({
      id: item.id,
      question: item.question,
      answer: item.answer,
    });
    questionMap.set(item.category_id, list);
  }

  return (categories ?? []).map((category) => ({
    id: category.id,
    category: category.name,
    questions: questionMap.get(category.id) ?? [],
  }));
}

// GET - Fetch all FAQs
export async function GET() {
  try {
    return NextResponse.json(
      { success: true, data: await getFAQTree() },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

// POST - Create a new FAQ category or question
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    if (body.type === "category") {
      const { data, error } = await supabase
        .from("faq_categories")
        .insert({
          name: body.category,
          sort_order: 0,
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        data: { id: data.id, category: data.name, questions: [] },
      });
    } else if (body.type === "question") {
      const { data, error } = await supabase
        .from("faq_items")
        .insert({
          category_id: body.categoryId,
          question: body.question,
          answer: body.answer,
          sort_order: 0,
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        data: { id: data.id, question: data.question, answer: data.answer },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    if (body.type === "category") {
      if (!body.id) {
        return NextResponse.json(
          { success: false, error: "Category ID is required" },
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from("faq_categories")
        .update({ name: body.category })
        .eq("id", body.id)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        data: { id: data.id, category: data.name },
      });
    }

    if (body.type === "question") {
      if (!body.id) {
        return NextResponse.json(
          { success: false, error: "Question ID is required" },
          { status: 400 }
        );
      }
      const { data, error } = await supabase
        .from("faq_items")
        .update({
          category_id: body.categoryId,
          question: body.question,
          answer: body.answer,
        })
        .eq("id", body.id)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        data: { id: data.id, question: data.question, answer: data.answer },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ category or question
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "ID and type are required" },
        { status: 400 }
      );
    }
    if (type === "category") {
      const { error } = await supabase.from("faq_categories").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Deleted successfully" });
    }
    if (type === "question") {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Deleted successfully" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
