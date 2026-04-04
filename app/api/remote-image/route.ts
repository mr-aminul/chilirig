import { NextRequest, NextResponse } from "next/server";

function isBlockedHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
}

function extractImageUrlFromHtml(html: string, pageUrl: URL) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = match?.[1]?.trim();
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate, pageUrl).toString();
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchResolvedImage(url: URL, attemptsLeft = 2): Promise<Response> {
  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstream fetch failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
    return response;
  }

  if (!contentType.includes("text/html") || attemptsLeft <= 0) {
    throw new Error("URL did not resolve to an image");
  }

  const html = await response.text();
  const resolvedImageUrl = extractImageUrlFromHtml(html, url);
  if (!resolvedImageUrl) {
    throw new Error("Could not extract image from page");
  }

  const nextUrl = new URL(resolvedImageUrl);
  if (
    (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") ||
    isBlockedHostname(nextUrl.hostname)
  ) {
    throw new Error("Resolved image URL is unsupported");
  }

  return fetchResolvedImage(nextUrl, attemptsLeft - 1);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json(
      { success: false, error: "Image URL is required" },
      { status: 400 }
    );
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(urlParam);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid image URL" },
      { status: 400 }
    );
  }

  if (
    (upstreamUrl.protocol !== "http:" && upstreamUrl.protocol !== "https:") ||
    isBlockedHostname(upstreamUrl.hostname)
  ) {
    return NextResponse.json(
      { success: false, error: "Unsupported image URL" },
      { status: 400 }
    );
  }

  try {
    const upstreamResponse = await fetchResolvedImage(upstreamUrl);

    const imageBuffer = await upstreamResponse.arrayBuffer();
    const contentType =
      upstreamResponse.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to resolve remote image" },
      { status: 500 }
    );
  }
}
