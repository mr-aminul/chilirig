import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
}

function extractGoogleDriveFileId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname === "drive.google.com" || url.hostname === "www.drive.google.com") {
      const idFromQuery = url.searchParams.get("id");
      if (idFromQuery) {
        return idFromQuery;
      }

      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      return fileMatch?.[1] ?? null;
    }

    if (url.hostname === "lh3.googleusercontent.com") {
      const fileMatch = url.pathname.match(/\/d\/([^/=]+)/);
      return fileMatch?.[1] ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeImageUrl(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("/")) {
    return trimmedValue;
  }

  const googleDriveFileId = extractGoogleDriveFileId(trimmedValue);
  if (googleDriveFileId) {
    return `/api/drive-image?id=${googleDriveFileId}&size=w2000`;
  }

  try {
    const url = new URL(trimmedValue);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return `/api/remote-image?url=${encodeURIComponent(trimmedValue)}`;
    }
  } catch {
    return trimmedValue;
  }

  return trimmedValue;
}

/** Turn `/api/remote-image?url=…` back into the real URL before saving to the database. */
export function canonicalImageUrlForStorage(value: string): string {
  const v = value.trim();
  if (!v) return v;
  if (!v.startsWith("/api/remote-image")) return v;
  try {
    const parsed = new URL(v, "http://local.invalid");
    const inner = parsed.searchParams.get("url");
    if (inner) return inner;
  } catch {
    /* ignore */
  }
  return v;
}
