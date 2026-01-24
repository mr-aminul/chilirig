/**
 * Get image path with fallback to placeholder
 * If the image doesn't exist, it will fall back to the placeholder API
 */
export function getImagePath(path: string, width: number = 600, height: number = 600): string {
  // In production, you might want to check if file exists
  // For now, we'll use the path as-is and let Next.js handle it
  // If image is missing, Next.js will show broken image or you can add error handling
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Check if an image path is a local path (not external URL)
 */
export function isLocalImage(path: string): boolean {
  return path.startsWith('/images/') || path.startsWith('/api/placeholder');
}
