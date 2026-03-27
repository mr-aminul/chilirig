import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getHeroContent, saveHeroContent } from "@/lib/hero-content";

/** Hero must always read live Supabase data — static caching would freeze slides at build time. */
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

const heroSlideSchema = z.object({
  id: z.string().min(1),
  image: z.string().min(1),
  alt: z.string().min(1),
});

const heroContentSchema = z.object({
  slides: z.array(heroSlideSchema).min(1),
});

export async function GET() {
  try {
    const hero = await getHeroContent();
    return NextResponse.json({ success: true, data: hero }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero content" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const parsed = heroContentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid hero payload" },
        { status: 400 }
      );
    }

    const hero = await saveHeroContent(parsed.data);
    return NextResponse.json({ success: true, data: hero });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update hero content" },
      { status: 500 }
    );
  }
}
