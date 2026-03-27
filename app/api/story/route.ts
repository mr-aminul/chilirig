import { NextRequest, NextResponse } from "next/server";
import { StoryContent } from "@/data/story";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

async function loadStory(): Promise<StoryContent | null> {
  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("story_pages")
    .select("*")
    .eq("slug", "our-story")
    .single();
  if (pageError) throw pageError;

  const { data: sections, error: sectionsError } = await supabase
    .from("story_sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });
  if (sectionsError) throw sectionsError;

  const sectionIds = (sections ?? []).map((s) => s.id);
  let promises: any[] = [];
  if (sectionIds.length > 0) {
    const { data, error } = await supabase
      .from("story_promises")
      .select("*")
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    promises = data ?? [];
  }

  const promisesMap = new Map<string, any[]>();
  for (const promise of promises) {
    const list = promisesMap.get(promise.section_id) ?? [];
    list.push({
      id: promise.id,
      title: promise.title,
      description: promise.description,
    });
    promisesMap.set(promise.section_id, list);
  }

  return {
    id: page.id,
    pageTitle: page.page_title,
    pageSubtitle: page.page_subtitle,
    sections: (sections ?? []).map((section, index) => ({
      id: section.id,
      type: section.section_type,
      title: section.title ?? undefined,
      subtitle: section.subtitle ?? undefined,
      description: section.description ?? undefined,
      image: section.image ?? undefined,
      imageAlt: section.image_alt ?? undefined,
      imagePosition: section.image_position ?? undefined,
      promises: promisesMap.get(section.id) ?? undefined,
      ctaText: section.cta_text ?? undefined,
      ctaLink: section.cta_link ?? undefined,
      order: section.sort_order ?? index + 1,
    })),
  };
}

// GET - Fetch story content
export async function GET() {
  try {
    const story = await loadStory();
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

    const updated = await loadStory();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update story content" },
      { status: 500 }
    );
  }
}
