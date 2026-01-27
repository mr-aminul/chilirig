import { NextRequest, NextResponse } from "next/server";
import { faqs, FAQCategory } from "@/data/faq";
import { requireAuth } from "@/lib/auth";

// GET - Fetch all FAQs
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

// POST - Create a new FAQ category or question
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    
    if (body.type === "category") {
      const newCategory: FAQCategory = {
        id: Date.now().toString(),
        category: body.category,
        questions: [],
      };
      return NextResponse.json({ success: true, data: newCategory });
    } else if (body.type === "question") {
      const newQuestion = {
        id: Date.now().toString(),
        question: body.question,
        answer: body.answer,
      };
      return NextResponse.json({ success: true, data: newQuestion });
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
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE - Delete FAQ category or question
export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "ID and type are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
