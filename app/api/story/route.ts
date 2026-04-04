import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStoryContent } from "@/lib/story-content";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

// GET - Fetch story content
export async function GET() {
  try {
    const story = await getStoryContent();
    if (!story) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch story content" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json({ success: true, data: story }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch story content" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

// PUT - Update story content
export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const pagePayload = {
      slug: "our-story",
      page_title: body.pageTitle ?? "Our Story",
      page_subtitle: body.pageSubtitle ?? "",
    };

    const { data: page, error: pageError } = await supabase
      .from("story_pages")
      .upsert(pagePayload, { onConflict: "slug" })
      .select("*")
      .single();
    if (pageError) throw pageError;

    const pageId = page.id as string;
    await supabase.from("story_sections").delete().eq("page_id", pageId);

    const sectionRows = (body.sections ?? []).map((section: any, index: number) => ({
      page_id: pageId,
      section_type: section.type,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      description: section.description ?? null,
      image: section.image ?? null,
      image_alt: section.imageAlt ?? null,
      image_position: section.imagePosition ?? null,
      cta_text: section.ctaText ?? null,
      cta_link: section.ctaLink ?? null,
      sort_order: section.order ?? index + 1,
    }));

    if (sectionRows.length > 0) {
      const { data: insertedSections, error: sectionsError } = await supabase
        .from("story_sections")
        .insert(sectionRows)
        .select("*");
      if (sectionsError) throw sectionsError;

      const promiseRows: any[] = [];
      for (const insertedSection of insertedSections ?? []) {
        const source = (body.sections ?? []).find(
          (s: any) => (s.order ?? 0) === insertedSection.sort_order
        );
        if (source?.type === "promises" && Array.isArray(source.promises)) {
          source.promises.forEach((promise: any, idx: number) => {
            promiseRows.push({
              section_id: insertedSection.id,
              title: promise.title ?? "",
              description: promise.description ?? "",
              sort_order: idx + 1,
            });
          });
        }
      }
      if (promiseRows.length > 0) {
        const { error: promisesError } = await supabase
          .from("story_promises")
          .insert(promiseRows);
        if (promisesError) throw promisesError;
      }
    }

    const updated = await getStoryContent();
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to load story after update" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, data: updated },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update story content" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
