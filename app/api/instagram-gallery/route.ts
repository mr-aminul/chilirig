import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  getInstagramGalleryContent,
  saveInstagramGalleryContent,
} from "@/lib/instagram-gallery-content";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

const tileSchema = z.object({
  id: z.string().min(1),
  image: z.string().min(1),
  alt: z.string().min(1),
  href: z.string().optional(),
});

const contentSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().min(1),
  tiles: z.array(tileSchema).min(1).max(12),
});

export async function GET() {
  try {
    const data = await getInstagramGalleryContent();
    return NextResponse.json({ success: true, data }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch Instagram gallery" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const parsed = contentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid Instagram gallery payload" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = await saveInstagramGalleryContent({
      heading: parsed.data.heading,
      subheading: parsed.data.subheading,
      tiles: parsed.data.tiles.map((t) => ({
        id: t.id,
        image: t.image,
        alt: t.alt,
        href: t.href?.trim() || "",
      })),
    });

    return NextResponse.json({ success: true, data }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update Instagram gallery";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
