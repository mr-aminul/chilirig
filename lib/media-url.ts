import { normalizeImageUrl } from "@/lib/utils";

/** Next/Image and public UI: proxy remote URLs when needed. DB holds canonical URLs. */
export function imageSrcForNext(url: string): string {
  return normalizeImageUrl(url.trim());
}
