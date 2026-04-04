/**
 * Client-side JSON fetch with no HTTP cache. Use for all public data reads.
 */
export async function fetchApiJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  return response.json() as Promise<T>;
}
