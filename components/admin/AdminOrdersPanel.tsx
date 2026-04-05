"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

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
  total: number;
  shipping: number;
  status: string | null;
  pathao_consignment_id: string | null;
  pathao_error: string | null;
  created_at?: string | null;
}

function formatOrderDate(value?: string | null) {
  if (!value) return "Unknown date";

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

function statusBadgeLabel(order: AdminOrder) {
  if (order.pathao_consignment_id) return "Sent to Pathao";
  return order.status || "Pending";
}

function statusBadgeVariant(order: AdminOrder): "default" | "secondary" | "outline" {
  if (order.pathao_consignment_id) return "default";
  if ((order.status || "").toLowerCase() === "new") return "secondary";
  return "outline";
}

type AdminOrdersPanelProps = {
  /** When true, omit page chrome (back link, outer full-height wrapper). */
  embedded?: boolean;
  /** Called after a successful Pathao dispatch so parents can refresh badges, etc. */
  onOrdersChanged?: () => void;
};

export function AdminOrdersPanel({ embedded = false, onOrdersChanged }: AdminOrdersPanelProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(data.orders ?? []);
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
    () => orders.filter((order) => !order.pathao_consignment_id).length,
    [orders]
  );

  const handleDispatch = async (orderId: string) => {
    setDispatchingId(orderId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ? `[${response.status}] ${data.error}` : "Failed to send order to Pathao");
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
      onOrdersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send order to Pathao");
      await loadOrders();
    } finally {
      setDispatchingId(null);
    }
  };

  const inner = (
    <main
      className={
        embedded
          ? "w-full max-w-none py-0"
          : "container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      }
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {!embedded && (
            <div className="mb-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back to admin
                </Button>
              </Link>
            </div>
          )}
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New orders stay here until you manually send them to Pathao.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3 sm:px-5">
          <Truck className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending dispatch
            </p>
            <p className="text-2xl font-bold tabular-nums">{pendingCount}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading orders...
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders placed from checkout will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 bg-white/80 shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-left text-xs leading-tight">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.03]">
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Order
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 text-right font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Ship
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 text-right font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Pathao
                </th>
                <th
                  scope="col"
                  className="px-2 py-1.5 text-right font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const address = [order.address, order.area_name, order.zone_name, order.city_name]
                  .filter(Boolean)
                  .join(", ");
                const isDispatching = dispatchingId === order.id;
                const canDispatch = !order.pathao_consignment_id && !isDispatching;

                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-black/10 align-middle transition-colors hover:bg-black/[0.02]">
                      <td className="px-2 py-1.5 font-semibold tabular-nums">{order.order_number}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">
                        {formatOrderDate(order.created_at)}
                      </td>
                      <td className="px-2 py-1.5 max-w-[180px]">
                        <div className="font-medium leading-none">{order.full_name}</div>
                        <div className="truncate text-[10px] leading-tight text-muted-foreground" title={order.email}>
                          {order.email}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <div className="leading-none">{order.phone}</div>
                        {order.secondary_phone ? (
                          <div className="text-[10px] leading-tight text-muted-foreground">
                            {order.secondary_phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2 py-1.5 max-w-[200px]">
                        <p className="line-clamp-1 text-muted-foreground" title={address}>
                          {address || "—"}
                        </p>
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">
                        {formatPrice(order.shipping || 0)}
                      </td>
                      <td className="px-2 py-1.5 text-right font-semibold tabular-nums">
                        {formatPrice(order.total || 0)}
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant={statusBadgeVariant(order)}
                          className="px-1.5 py-0 text-[10px] font-medium leading-none"
                        >
                          {statusBadgeLabel(order)}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5 max-w-[120px]">
                        <span
                          className={`block truncate font-mono text-[10px] leading-none ${
                            order.pathao_error ? "text-red-600" : "text-muted-foreground"
                          }`}
                          title={
                            order.pathao_consignment_id ||
                            (order.pathao_error ? order.pathao_error : undefined)
                          }
                        >
                          {order.pathao_consignment_id || (order.pathao_error ? "Failed" : "—")}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <Button
                          size="sm"
                          className="h-7 gap-1 whitespace-nowrap px-2 text-[11px]"
                          onClick={() => void handleDispatch(order.id)}
                          disabled={!canDispatch}
                        >
                          {isDispatching ? (
                            <>
                              <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
                              Sending
                            </>
                          ) : order.pathao_consignment_id ? (
                            "Sent"
                          ) : (
                            <>
                              <Truck className="h-3 w-3 shrink-0" />
                              Pathao
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                    {order.pathao_error ? (
                      <tr className="border-b border-black/10 bg-red-50/80">
                        <td colSpan={10} className="px-2 py-1 text-[10px] leading-snug text-red-800">
                          <span className="font-semibold">Pathao error: </span>
                          {order.pathao_error}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );

  if (embedded) {
    return <div className="bg-background">{inner}</div>;
  }

  return <div className="min-h-screen bg-background">{inner}</div>;
}
