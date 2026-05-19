export const ORDER_STATUS_CANCELLED = "cancelled";

export function isOrderCancelled(status: string | null | undefined) {
  return (status || "").toLowerCase() === ORDER_STATUS_CANCELLED;
}
