import "server-only";

import { StoryContent } from "@/data/story";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalizeImageUrl } from "@/lib/utils";

export async function getStoryContent(): Promise<StoryContent | null> {
  try {
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
    let promiseRows: {
      id: string;
      section_id: string;
      title: string;
      description: string;
      sort_order: number;
    }[] = [];
    if (sectionIds.length > 0) {
      const { data, error } = await supabase
        .from("story_promises")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      promiseRows = data ?? [];
    }

    const promisesMap = new Map<
      string,
      { id: string; title: string; description: string }[]
    >();
    for (const row of promiseRows) {
      const list = promisesMap.get(row.section_id) ?? [];
      list.push({
        id: row.id,
        title: row.title,
        description: row.description,
      });
      promisesMap.set(row.section_id, list);
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
        image: section.image ? normalizeImageUrl(section.image) : undefined,
        imageAlt: section.image_alt ?? undefined,
        imagePosition: section.image_position ?? undefined,
        promises: promisesMap.get(section.id) ?? undefined,
        ctaText: section.cta_text ?? undefined,
        ctaLink: section.cta_link ?? undefined,
        order: section.sort_order ?? index + 1,
      })),
    };
  } catch {
    return null;
  }
}
