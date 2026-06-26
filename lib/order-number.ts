/**
 * Generate a human-readable order number, e.g. "CR-20260626-A1B2".
 * Shared by checkout (new orders) and admin (re-created orders).
 */
export function generateOrderNumber(date = new Date()): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CR-${dateStr}-${random}`;
}
