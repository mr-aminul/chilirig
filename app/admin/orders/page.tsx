"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface AdminOrder {
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

export default function AdminOrdersPage() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send order to Pathao");
      await loadOrders();
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Back to admin
                </Button>
              </Link>
            </div>
            <h1 className="font-display text-3xl font-bold">Orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              New orders stay here until you manually send them to Pathao.
            </p>
          </div>

          <Card className="min-w-56">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Pending dispatch</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
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
          <div className="space-y-4">
            {orders.map((order) => {
              const address = [order.address, order.area_name, order.zone_name, order.city_name]
                .filter(Boolean)
                .join(", ");
              const isDispatching = dispatchingId === order.id;
              const canDispatch = !order.pathao_consignment_id && !isDispatching;

              return (
                <Card key={order.id}>
                  <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{order.order_number}</CardTitle>
                        <Badge variant={statusBadgeVariant(order)}>
                          {statusBadgeLabel(order)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Order total</p>
                        <p className="text-xl font-bold">{formatPrice(order.total || 0)}</p>
                      </div>
                      <Button
                        onClick={() => void handleDispatch(order.id)}
                        disabled={!canDispatch}
                      >
                        {isDispatching ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : order.pathao_consignment_id ? (
                          "Already sent"
                        ) : (
                          <>
                            <Truck className="h-4 w-4" />
                            Send to Pathao
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="mt-1 font-semibold">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="mt-1 font-semibold">{order.phone}</p>
                      {order.secondary_phone && (
                        <p className="text-sm text-muted-foreground">
                          Alt: {order.secondary_phone}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Delivery address</p>
                      <p className="mt-1 text-sm leading-6">{address}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Shipping</p>
                      <p className="mt-1 text-sm">{formatPrice(order.shipping || 0)}</p>
                    </div>

                    <div className="sm:col-span-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Pathao consignment
                      </p>
                      <p className="mt-1 font-mono text-sm">
                        {order.pathao_consignment_id || "Not sent yet"}
                      </p>
                    </div>

                    {order.pathao_error && (
                      <div className="sm:col-span-4">
                        <p className="text-sm font-medium text-red-700">Last Pathao error</p>
                        <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                          {order.pathao_error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
