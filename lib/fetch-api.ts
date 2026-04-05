const NO_BROWSER_CACHE = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
} as const;

/**
 * Append a one-off query param so intermediaries cannot reuse a stale JSON response.
 */
export function withCacheBust(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}_=${Date.now()}`;
}

/**
 * Client-side JSON fetch with no HTTP cache. Use for all public data reads.
 */
export async function fetchApiJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: NO_BROWSER_CACHE,
  });
  return response.json() as Promise<T>;
}
