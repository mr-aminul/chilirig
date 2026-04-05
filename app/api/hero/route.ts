import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getHeroAdminImages, getHeroContent, saveHeroAdminImages } from "@/lib/hero-content";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

const putSchema = z.object({
  images: z.tuple([z.string(), z.string(), z.string()]),
});

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

export async function GET() {
  try {
    const images = await getHeroAdminImages();
    return NextResponse.json(
      { success: true, data: { images } },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Hero GET error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Body must be { images: [string, string, string] }" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await saveHeroAdminImages(parsed.data.images);
    const images = await getHeroAdminImages();
    const { slides } = await getHeroContent();

    return NextResponse.json(
      { success: true, data: { images, slides } },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Hero PUT error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
