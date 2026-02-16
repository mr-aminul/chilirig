"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { useOrders, type PlacedOrder } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Package, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function trackingUrl(order: PlacedOrder): string | null {
  if (!order.pathaoConsignmentId || !order.orderPhone) return null;
  const phone = order.orderPhone
    .replace(/\D/g, "")
    .replace(/^(\d{10})$/, "0$1")
    .slice(0, 11);
  if (phone.length !== 11) return null;
  return `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(order.pathaoConsignmentId)}&phone=${encodeURIComponent(phone)}`;
}

function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function OrdersPage() {
  const orders = useOrders((s) => s.orders);
  const [copiedWhich, setCopiedWhich] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedWhich(key);
      setTimeout(() => setCopiedWhich(null), 2000);
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-[80vh]">
        <SectionContainer>
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Your orders
            </h1>
            <p className="mb-8 max-w-md text-base text-gray-600">
              Orders you placed on this device (saved in this browser).
            </p>

            {orders.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
                <div className="px-6 py-12 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-6 text-gray-600">You haven’t placed any orders yet.</p>
                  <Link href="/shop">
                    <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]">
                      Shop now
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => {
                  const trackUrl = trackingUrl(order);
                  return (
                    <li
                      key={order.orderId}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm"
                    >
                      <div className="border-b border-gray-200/80 bg-white px-4 py-4 sm:px-5">
                        <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                          Order Summary
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatOrderDate(order.date)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
                          <span className="shrink-0 text-sm font-medium text-gray-600">
                            Order ID
                          </span>
                          <span className="min-w-0 truncate font-mono text-sm font-semibold text-gray-900 tracking-tight">
                            {order.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(order.orderId, `${order.orderId}-order`)
                            }
                            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1"
                            aria-label="Copy order ID"
                          >
                            {copiedWhich === `${order.orderId}-order` ? (
                              <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                            ) : (
                              <Copy className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        </div>
                        {order.pathaoConsignmentId && (
                          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
                            <span className="shrink-0 text-sm font-medium text-gray-600">
                              Tracking ID
                            </span>
                            <span className="min-w-0 truncate font-mono text-sm font-semibold text-gray-900 tracking-tight">
                              {order.pathaoConsignmentId}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  order.pathaoConsignmentId!,
                                  `${order.orderId}-tracking`
                                )
                              }
                              className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1"
                              aria-label="Copy tracking ID"
                            >
                              {copiedWhich === `${order.orderId}-tracking` ? (
                                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                              ) : (
                                <Copy className="h-4 w-4" aria-hidden />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-5">
                        {order.itemsSummary && (
                          <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                            {order.itemsSummary}
                          </p>
                        )}
                        {order.total != null && (
                          <p className="mb-3 text-sm font-semibold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                        )}
                        {trackUrl && (
                          <a
                            href={trackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                          >
                            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                            Track Delivery
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
