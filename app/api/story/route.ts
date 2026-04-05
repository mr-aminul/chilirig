import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { type StoryPageContent, type StoryPromiseIcon } from "@/data/story";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { canonicalImageUrlForStorage } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STORY_COLUMNS =
  "singleton_key,hero_title,hero_subtitle,section1_heading,section1_body,section1_image_url,section2_heading,section2_body,section2_image_url,promise_1_title,promise_1_body,promise_1_icon,promise_2_title,promise_2_body,promise_2_icon,promise_3_title,promise_3_body,promise_3_icon,cta_label,cta_href,updated_at";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const iconSchema = z.enum(["leaf", "flame", "layers"]);

const storyPutSchema = z.object({
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  section1: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    imageUrl: z.string().min(1),
  }),
  section2: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    imageUrl: z.string().min(1),
  }),
  promises: z.tuple([
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      icon: iconSchema,
    }),
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      icon: iconSchema,
    }),
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
      icon: iconSchema,
    }),
  ]),
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
});

type StoryRow = {
  singleton_key: string;
  hero_title: string;
  hero_subtitle: string;
  section1_heading: string;
  section1_body: string;
  section1_image_url: string;
  section2_heading: string;
  section2_body: string;
  section2_image_url: string;
  promise_1_title: string;
  promise_1_body: string;
  promise_1_icon: StoryPromiseIcon;
  promise_2_title: string;
  promise_2_body: string;
  promise_2_icon: StoryPromiseIcon;
  promise_3_title: string;
  promise_3_body: string;
  promise_3_icon: StoryPromiseIcon;
  cta_label: string;
  cta_href: string;
};

function rowToContent(row: StoryRow): StoryPageContent {
  return {
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    section1: {
      heading: row.section1_heading,
      body: row.section1_body,
      imageUrl: row.section1_image_url,
    },
    section2: {
      heading: row.section2_heading,
      body: row.section2_body,
      imageUrl: row.section2_image_url,
    },
    promises: [
      {
        title: row.promise_1_title,
        body: row.promise_1_body,
        icon: row.promise_1_icon,
      },
      {
        title: row.promise_2_title,
        body: row.promise_2_body,
        icon: row.promise_2_icon,
      },
      {
        title: row.promise_3_title,
        body: row.promise_3_body,
        icon: row.promise_3_icon,
      },
    ],
    cta: { label: row.cta_label, href: row.cta_href },
  };
}

function contentToRow(content: StoryPageContent): Omit<StoryRow, "singleton_key"> {
  const [p1, p2, p3] = content.promises;
  return {
    hero_title: content.heroTitle,
    hero_subtitle: content.heroSubtitle,
    section1_heading: content.section1.heading,
    section1_body: content.section1.body,
    section1_image_url: canonicalImageUrlForStorage(content.section1.imageUrl.trim()),
    section2_heading: content.section2.heading,
    section2_body: content.section2.body,
    section2_image_url: canonicalImageUrlForStorage(content.section2.imageUrl.trim()),
    promise_1_title: p1.title,
    promise_1_body: p1.body,
    promise_1_icon: p1.icon,
    promise_2_title: p2.title,
    promise_2_body: p2.body,
    promise_2_icon: p2.icon,
    promise_3_title: p3.title,
    promise_3_body: p3.body,
    promise_3_icon: p3.icon,
    cta_label: content.cta.label,
    cta_href: content.cta.href.trim(),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("story_page")
      .select(STORY_COLUMNS)
      .eq("singleton_key", "x")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: true, data: null }, { headers: NO_STORE_HEADERS });
    }
    return NextResponse.json(
      { success: true, data: rowToContent(data as StoryRow) },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch story" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  let parsed: z.infer<typeof storyPutSchema>;
  try {
    const body = await request.json();
    parsed = storyPutSchema.parse(body);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid story payload" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const row = { singleton_key: "x" as const, ...contentToRow(parsed), updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from("story_page")
      .upsert(row, { onConflict: "singleton_key" })
      .select(STORY_COLUMNS)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: rowToContent(data as StoryRow) });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save story" }, { status: 500 });
  }
}
