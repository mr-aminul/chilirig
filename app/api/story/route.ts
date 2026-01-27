import { NextRequest, NextResponse } from "next/server";
import { storyContent, StoryContent } from "@/data/story";
import { requireAuth } from "@/lib/auth";

// GET - Fetch story content
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: storyContent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch story content" },
      { status: 500 }
    );
  }
}

// PUT - Update story content
export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const updatedContent: StoryContent = {
      ...storyContent,
      ...body,
    };

    // In a real app, you'd save to a database
    return NextResponse.json({ success: true, data: updatedContent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update story content" },
      { status: 500 }
    );
  }
}
