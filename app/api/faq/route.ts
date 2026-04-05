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
      supabase
        .from("faq_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
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
      const { data: maxRow } = await supabase
        .from("faq_items")
        .select("sort_order")
        .eq("category_id", body.categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextSortOrder = (maxRow?.sort_order ?? -1) + 1;

      const { data, error } = await supabase
        .from("faq_items")
        .insert({
          category_id: body.categoryId,
          question: body.question,
          answer: body.answer,
          sort_order: nextSortOrder,
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

// PATCH - Reorder questions within a category (body: { categoryId, questionIds })
export async function PATCH(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const categoryId = body.categoryId as string | undefined;
    const questionIds = body.questionIds as string[] | undefined;

    if (!categoryId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "categoryId and non-empty questionIds are required" },
        { status: 400 }
      );
    }

    if (new Set(questionIds).size !== questionIds.length) {
      return NextResponse.json(
        { success: false, error: "questionIds must not contain duplicates" },
        { status: 400 }
      );
    }

    const { data: rows, error: fetchError } = await supabase
      .from("faq_items")
      .select("id")
      .eq("category_id", categoryId);

    if (fetchError) throw fetchError;

    const dbIds = new Set((rows ?? []).map((r) => r.id as string));
    if (questionIds.length !== dbIds.size) {
      return NextResponse.json(
        { success: false, error: "questionIds must list every question in the category exactly once" },
        { status: 400 }
      );
    }
    for (const id of questionIds) {
      if (!dbIds.has(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid question id for this category" },
          { status: 400 }
        );
      }
    }

    const updates = questionIds.map((id, index) =>
      supabase.from("faq_items").update({ sort_order: index + 1 }).eq("id", id).eq("category_id", categoryId)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) throw firstError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reorder FAQ questions" },
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
