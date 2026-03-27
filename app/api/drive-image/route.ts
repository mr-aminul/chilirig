import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const size = searchParams.get("size") || "w2000";

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Drive image ID is required" },
      { status: 400 }
    );
  }

  try {
    const upstreamUrl = `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=${encodeURIComponent(size)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "force-cache",
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch Drive image" },
        { status: upstreamResponse.status }
      );
    }

    const imageBuffer = await upstreamResponse.arrayBuffer();
    const contentType =
      upstreamResponse.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to proxy Drive image" },
      { status: 500 }
    );
  }
}
