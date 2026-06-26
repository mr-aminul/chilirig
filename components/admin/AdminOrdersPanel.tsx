"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Loader2, Package, Search, Trash2, Truck, X } from "lucide-react";
import { OrderConfirmDialog } from "@/components/admin/OrderConfirmDialog";
import { isOrderCancelled } from "@/lib/order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export interface AdminOrderItem {
  id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  secondary_phone: string | null;
  address: string;
  city_name: string;
  zone_name: string;
  area_name: string;
  subtotal: number;
  total: number;
  shipping: number;
  status: string | null;
  pathao_consignment_id: string | null;
  pathao_error: string | null;
  pathao_cancelled_at?: string | null;
  created_at?: string | null;
  items: AdminOrderItem[];
}

function formatOrderDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatItemsSummary(items: AdminOrderItem[]) {
  if (items.length === 0) return "—";
  return items.map((item) => `${item.product_name} × ${item.quantity}`).join(", ");
}

function formatDeliveryAddress(order: AdminOrder) {
  return [order.address, order.area_name, order.zone_name, order.city_name]
    .filter(Boolean)
    .join(", ");
}

// A cancelled order that still has a Pathao consignment but no recorded Pathao
// cancellation is only cancelled locally — the shipment may still be active in
// Pathao Courier, so we must not claim it is "Cancelled".
function isCancelledLocallyOnly(order: AdminOrder) {
  return (
    isOrderCancelled(order.status) &&
    Boolean(order.pathao_consignment_id) &&
    !order.pathao_cancelled_at
  );
}

function statusLabel(order: AdminOrder) {
  if (isOrderCancelled(order.status)) {
    return isCancelledLocallyOnly(order) ? "Cancel pending" : "Cancelled";
  }
  if (order.pathao_consignment_id) return "Pathao sent";
  if (order.pathao_error) return "Pathao failed";
  return order.status || "Pending";
}

function statusClass(order: AdminOrder) {
  if (isOrderCancelled(order.status)) {
    return isCancelledLocallyOnly(order) ? "text-amber-700" : "text-neutral-500";
  }
  if (order.pathao_consignment_id) return "text-green-700";
  if (order.pathao_error) return "text-red-600";
  if ((order.status || "").toLowerCase() === "new") return "text-amber-700";
  return "text-neutral-600";
}

type AdminOrdersPanelProps = {
  embedded?: boolean;
  onOrdersChanged?: () => void;
};

export function AdminOrdersPanel({ embedded = false, onOrdersChanged }: AdminOrdersPanelProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [recreatingId, setRecreatingId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<AdminOrder | null>(null);
  const [orderToDispatch, setOrderToDispatch] = useState<AdminOrder | null>(null);
  const [orderToRecreate, setOrderToRecreate] = useState<AdminOrder | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [cancelConfirmText, setCancelConfirmText] = useState("");
  const [search, setSearch] = useState("");

  const DELETE_CONFIRM_WORD = "delete";
  const CANCEL_CONFIRM_WORD = "cancel";

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(
        (data.orders ?? []).map((order: AdminOrder) => ({
          ...order,
          items: order.items ?? [],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) => !order.pathao_consignment_id && !isOrderCancelled(order.status)
      ).length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.order_number,
        order.full_name,
        order.email,
        order.phone,
        order.secondary_phone ?? "",
        formatDeliveryAddress(order),
        ...order.items.map((i) => i.product_name),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, search]);

  const handleDispatch = async (orderId: string) => {
    setDispatchingId(orderId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ? `[${response.status}] ${data.error}` : "Failed to send order to Pathao"
        );
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                pathao_consignment_id: data.consignmentId ?? order.pathao_consignment_id,
                pathao_error: null,
              }
            : order
        )
      );
      setOrderToDispatch(null);
      onOrdersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send order to Pathao");
      await loadOrders();
    } finally {
      setDispatchingId(null);
    }
  };

  const closeDispatchDialog = () => {
    setOrderToDispatch(null);
  };

  const closeDeleteDialog = () => {
    setOrderToDelete(null);
    setDeleteConfirmText("");
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete || deleteConfirmText.trim() !== DELETE_CONFIRM_WORD) return;

    const orderId = orderToDelete.id;
    setDeletingId(orderId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      setOrders((current) => current.filter((order) => order.id !== orderId));
      closeDeleteDialog();
      onOrdersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  const closeCancelDialog = () => {
    setOrderToCancel(null);
    setCancelConfirmText("");
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || cancelConfirmText.trim() !== CANCEL_CONFIRM_WORD) return;

    const orderId = orderToCancel.id;
    setCancellingId(orderId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled",
                pathao_error: null,
                pathao_cancelled_at: data.pathaoCancelled
                  ? new Date().toISOString()
                  : order.pathao_cancelled_at,
              }
            : order
        )
      );
      setNotice(data.message || "Order cancelled.");
      closeCancelDialog();
      onOrdersChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel order";
      setError(message);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, pathao_error: message } : order
        )
      );
    } finally {
      setCancellingId(null);
    }
  };

  const closeRecreateDialog = () => {
    setOrderToRecreate(null);
  };

  const handleRecreateOrder = async () => {
    if (!orderToRecreate) return;

    const orderId = orderToRecreate.id;
    setRecreatingId(orderId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/duplicate`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to re-create order");
      }

      const newOrder: AdminOrder = {
        ...data.order,
        items: data.order?.items ?? [],
      };
      setOrders((current) => [newOrder, ...current]);
      closeRecreateDialog();
      onOrdersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-create order");
    } finally {
      setRecreatingId(null);
    }
  };

  const canConfirmDelete = deleteConfirmText.trim() === DELETE_CONFIRM_WORD;
  const canConfirmCancel = cancelConfirmText.trim() === CANCEL_CONFIRM_WORD;

  return (
    <AdminOrdersPanelShell embedded={embedded}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <PanelTitle embedded={embedded} pendingCount={pendingCount} />
      </header>

      {orders.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded border-neutral-300 bg-white pl-8 text-sm shadow-none"
              aria-label="Search orders"
            />
          </div>
          {search.trim() ? (
            <span className="text-sm text-neutral-500">
              {filteredOrders.length} {filteredOrders.length === 1 ? "result" : "results"}
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="mb-3 flex items-start justify-between gap-3 border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 text-green-700/70 hover:text-green-900"
            aria-label="Dismiss confirmation"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 border border-neutral-200 bg-white py-16 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : filteredOrders.length === 0 ? (
        <NoSearchResults onClear={() => setSearch("")} />
      ) : (
        <OrdersTable
          orders={filteredOrders}
          dispatchingId={dispatchingId}
          deletingId={deletingId}
          cancellingId={cancellingId}
          recreatingId={recreatingId}
          onRequestDispatch={(order) => setOrderToDispatch(order)}
          onRequestRecreate={(order) => setOrderToRecreate(order)}
          onRequestCancel={(order) => {
            setOrderToCancel(order);
            setCancelConfirmText("");
          }}
          onRequestDelete={(order) => {
            setOrderToDelete(order);
            setDeleteConfirmText("");
          }}
        />
      )}

      {orderToDelete ? (
        <OrderConfirmDialog
          variant="delete"
          order={orderToDelete}
          confirmText={deleteConfirmText}
          onConfirmTextChange={setDeleteConfirmText}
          confirmWord={DELETE_CONFIRM_WORD}
          canConfirm={canConfirmDelete}
          isSubmitting={deletingId === orderToDelete.id}
          onDismiss={closeDeleteDialog}
          onConfirm={() => void handleDeleteOrder()}
        />
      ) : null}

      {orderToCancel ? (
        <OrderConfirmDialog
          variant="cancel"
          order={orderToCancel}
          confirmText={cancelConfirmText}
          onConfirmTextChange={setCancelConfirmText}
          confirmWord={CANCEL_CONFIRM_WORD}
          canConfirm={canConfirmCancel}
          isSubmitting={cancellingId === orderToCancel.id}
          onDismiss={closeCancelDialog}
          onConfirm={() => void handleCancelOrder()}
        />
      ) : null}

      {orderToDispatch ? (
        <OrderConfirmDialog
          variant="pathao"
          order={orderToDispatch}
          isSubmitting={dispatchingId === orderToDispatch.id}
          onDismiss={closeDispatchDialog}
          onConfirm={() => void handleDispatch(orderToDispatch.id)}
        />
      ) : null}

      {orderToRecreate ? (
        <OrderConfirmDialog
          variant="recreate"
          order={orderToRecreate}
          isSubmitting={recreatingId === orderToRecreate.id}
          onDismiss={closeRecreateDialog}
          onConfirm={() => void handleRecreateOrder()}
        />
      ) : null}
    </AdminOrdersPanelShell>
  );
}

function AdminOrdersPanelShell({
  embedded,
  children,
}: {
  embedded: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={embedded ? "bg-background" : "min-h-screen bg-neutral-50"}>
      <main
        className={
          embedded
            ? "w-full max-w-none py-0"
            : "container mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"
        }
      >
        {children}
      </main>
    </div>
  );
}

function PanelTitle({ embedded, pendingCount }: { embedded: boolean; pendingCount: number }) {
  return (
    <div>
      {!embedded ? (
        <div className="mb-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-600">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      ) : null}
      <h1 className="text-xl font-semibold text-neutral-900">Orders</h1>
      <p className="mt-0.5 text-sm text-neutral-500">{pendingCount} pending Pathao dispatch</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-neutral-300 bg-white py-16 text-center">
      <Package className="mx-auto mb-3 h-8 w-8 text-neutral-400" aria-hidden />
      <p className="font-medium text-neutral-800">No orders yet</p>
      <p className="mt-1 text-sm text-neutral-500">Checkout orders will show up here.</p>
    </div>
  );
}

function NoSearchResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="border border-neutral-200 bg-white py-12 text-center text-sm text-neutral-500">
      No matches.{" "}
      <button type="button" className="text-primary underline" onClick={onClear}>
        Clear search
      </button>
    </div>
  );
}

function OrdersTable({
  orders,
  dispatchingId,
  deletingId,
  cancellingId,
  recreatingId,
  onRequestDispatch,
  onRequestRecreate,
  onRequestCancel,
  onRequestDelete,
}: {
  orders: AdminOrder[];
  dispatchingId: string | null;
  deletingId: string | null;
  cancellingId: string | null;
  recreatingId: string | null;
  onRequestDispatch: (order: AdminOrder) => void;
  onRequestRecreate: (order: AdminOrder) => void;
  onRequestCancel: (order: AdminOrder) => void;
  onRequestDelete: (order: AdminOrder) => void;
}) {
  return (
    <div className="overflow-x-auto border border-neutral-200 bg-white">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2.5">Order</th>
            <th className="px-3 py-2.5">Date</th>
            <th className="px-3 py-2.5">Customer</th>
            <th className="px-3 py-2.5">Phone</th>
            <th className="min-w-[200px] px-3 py-2.5">Items</th>
            <th className="px-3 py-2.5">Address</th>
            <th className="px-3 py-2.5 text-right">Amount</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => (
            <OrdersTableRow
              key={order.id}
              order={order}
              isDispatching={dispatchingId === order.id}
              isDeleting={deletingId === order.id}
              isCancelling={cancellingId === order.id}
              isRecreating={recreatingId === order.id}
              onRequestDispatch={() => onRequestDispatch(order)}
              onRequestRecreate={() => onRequestRecreate(order)}
              onRequestCancel={() => onRequestCancel(order)}
              onRequestDelete={() => onRequestDelete(order)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderAmountBreakdown({ order }: { order: AdminOrder }) {
  const subtotal = order.subtotal ?? 0;
  const shipping = order.shipping ?? 0;

  return (
    <div className="tabular-nums">
      <p className="font-medium text-neutral-900">{formatPrice(subtotal)}</p>
      {shipping > 0 ? (
        <p className="mt-0.5 pl-2 text-xs text-neutral-500">+ {formatPrice(shipping)} shipping</p>
      ) : null}
    </div>
  );
}

function OrdersTableRow({
  order,
  isDispatching,
  isDeleting,
  isCancelling,
  isRecreating,
  onRequestDispatch,
  onRequestRecreate,
  onRequestCancel,
  onRequestDelete,
}: {
  order: AdminOrder;
  isDispatching: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
  isRecreating: boolean;
  onRequestDispatch: () => void;
  onRequestRecreate: () => void;
  onRequestCancel: () => void;
  onRequestDelete: () => void;
}) {
  const cancelled = isOrderCancelled(order.status);
  const actionsDisabled = isDispatching || isDeleting || isCancelling || isRecreating;
  // Cancelled orders that still hold a Pathao consignment can be cancelled again
  // to push the cancellation through to Pathao (e.g. stranded orders).
  const canCancel = !cancelled || Boolean(order.pathao_consignment_id);
  const itemsSummary = formatItemsSummary(order.items);
  const address = formatDeliveryAddress(order);

  return (
    <Fragment>
      <tr
        className={`align-top hover:bg-neutral-50/80 ${cancelled ? "bg-neutral-50/90 text-neutral-500" : ""}`}
      >
        <td className="px-3 py-2.5 font-medium tabular-nums text-neutral-900">
          {order.order_number}
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-neutral-600">
          {formatOrderDate(order.created_at)}
        </td>
        <td className="max-w-[160px] px-3 py-2.5">
          <div className="font-medium text-neutral-900">{order.full_name}</div>
          <div className="truncate text-xs text-neutral-500" title={order.email}>
            {order.email}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-neutral-700">
          <div>{order.phone}</div>
          {order.secondary_phone ? (
            <div className="text-xs text-neutral-500">{order.secondary_phone}</div>
          ) : null}
        </td>
        <td className="max-w-[240px] px-3 py-2.5 text-neutral-700">
          <p className="line-clamp-2" title={itemsSummary}>
            {itemsSummary}
          </p>
        </td>
        <td className="max-w-[200px] px-3 py-2.5 text-neutral-600">
          <p className="line-clamp-2" title={address}>
            {address || "—"}
          </p>
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-right">
          <OrderAmountBreakdown order={order} />
        </td>
        <td className="px-3 py-2.5">
          <span className={`text-xs font-medium ${statusClass(order)}`}>{statusLabel(order)}</span>
          {order.pathao_consignment_id ? (
            <p
              className="mt-0.5 max-w-[120px] truncate font-mono text-[10px] text-neutral-400"
              title={order.pathao_consignment_id}
            >
              {order.pathao_consignment_id}
            </p>
          ) : null}
        </td>
        <td className="px-3 py-2.5">
          <OrdersTableActions
            order={order}
            isDispatching={isDispatching}
            isDeleting={isDeleting}
            isCancelling={isCancelling}
            isRecreating={isRecreating}
            actionsDisabled={actionsDisabled}
            canCancel={canCancel}
            onRequestDispatch={onRequestDispatch}
            onRequestRecreate={onRequestRecreate}
            onRequestCancel={onRequestCancel}
            onRequestDelete={onRequestDelete}
          />
        </td>
      </tr>
      {order.pathao_error ? (
        <tr className="bg-red-50">
          <td colSpan={9} className="px-3 py-1.5 text-xs text-red-700">
            Pathao: {order.pathao_error}
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function OrdersTableActions({
  order,
  isDispatching,
  isDeleting,
  isCancelling,
  isRecreating,
  actionsDisabled,
  canCancel,
  onRequestDispatch,
  onRequestRecreate,
  onRequestCancel,
  onRequestDelete,
}: {
  order: AdminOrder;
  isDispatching: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
  isRecreating: boolean;
  actionsDisabled: boolean;
  canCancel: boolean;
  onRequestDispatch: () => void;
  onRequestRecreate: () => void;
  onRequestCancel: () => void;
  onRequestDelete: () => void;
}) {
  const cancelled = isOrderCancelled(order.status);
  const sent = Boolean(order.pathao_consignment_id);
  // Cancelled orders can't be dispatched again, so the same button re-creates a
  // fresh order for the customer instead. Sent (non-cancelled) orders stay locked.
  const pathaoMode: "dispatch" | "recreate" | "sent" = cancelled
    ? "recreate"
    : sent
      ? "sent"
      : "dispatch";
  const pathaoLabel =
    pathaoMode === "sent" ? "Sent" : pathaoMode === "recreate" ? "Resend" : "Pathao";
  const pathaoTitle =
    pathaoMode === "sent"
      ? "Already sent to Pathao"
      : pathaoMode === "recreate"
        ? "Re-create as a new order for the same customer"
        : "Send to Pathao";
  const pathaoBusy = isDispatching || isRecreating;
  const cancelTitle =
    cancelled && sent
      ? "Cancel Pathao shipment for this order"
      : "Cancel order (keeps record)";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded px-2 text-xs font-normal text-neutral-700 hover:bg-neutral-100"
        onClick={pathaoMode === "recreate" ? onRequestRecreate : onRequestDispatch}
        disabled={pathaoMode === "sent" || actionsDisabled}
        title={pathaoTitle}
      >
        {pathaoBusy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Truck className="h-3.5 w-3.5" aria-hidden />
        )}
        <span className="ml-1 hidden lg:inline">{pathaoLabel}</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded px-2 text-neutral-600 hover:bg-amber-50 hover:text-amber-800"
        onClick={onRequestCancel}
        disabled={!canCancel || actionsDisabled}
        aria-label={`Cancel ${order.order_number}`}
        title={cancelTitle}
      >
        {isCancelling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Ban className="h-3.5 w-3.5" aria-hidden />
        )}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded px-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
        onClick={onRequestDelete}
        disabled={actionsDisabled}
        aria-label={`Delete ${order.order_number}`}
        title="Delete order permanently"
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        )}
      </Button>
    </div>
  );
}
