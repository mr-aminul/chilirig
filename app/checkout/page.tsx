"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart, useOrders } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Minus, Plus, Trash2, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PathaoCity {
  city_id: number;
  city_name: string;
}
interface PathaoZone {
  zone_id: number;
  zone_name: string;
}
interface PathaoArea {
  area_id: number;
  area_name: string;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pathaoConsignmentId, setPathaoConsignmentId] = useState<string | null>(null);
  const [orderPhone, setOrderPhone] = useState<string | null>(null);
  const [pathaoError, setPathaoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    secondaryPhone: "",
    address: "",
    cityId: "",
    cityName: "",
    zoneId: "",
    zoneName: "",
    areaId: "",
    areaName: "",
  });
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [cities, setCities] = useState<PathaoCity[]>([]);
  const [zones, setZones] = useState<PathaoZone[]>([]);
  const [areas, setAreas] = useState<PathaoArea[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [shippingPrice, setShippingPrice] = useState<number | null>(null);
  const [shippingPriceLoading, setShippingPriceLoading] = useState(false);
  const [shippingPriceError, setShippingPriceError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"order" | "tracking" | null>(null);

  const cartWeightKg = Math.max(0.5, items.reduce((sum, i) => sum + i.quantity * 0.5, 0));

  useEffect(() => {
    fetch("/api/pathao/cities")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setCities(j.data);
      })
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  const loadZones = useCallback((cityId: string) => {
    if (!cityId) {
      setZones([]);
      setAreas([]);
      setShippingPrice(null);
      return;
    }
    setZonesLoading(true);
    setZones([]);
    setAreas([]);
    setShippingPrice(null);
    setFormData((prev) => ({ ...prev, zoneId: "", zoneName: "", areaId: "", areaName: "" }));
    fetch(`/api/pathao/zones?city_id=${encodeURIComponent(cityId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setZones(j.data);
      })
      .catch(() => {})
      .finally(() => setZonesLoading(false));
  }, []);

  const loadAreas = useCallback((zoneId: string) => {
    if (!zoneId) {
      setAreas([]);
      setShippingPrice(null);
      return;
    }
    setAreasLoading(true);
    setAreas([]);
    setShippingPrice(null);
    setFormData((prev) => ({ ...prev, areaId: "", areaName: "" }));
    fetch(`/api/pathao/areas?zone_id=${encodeURIComponent(zoneId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setAreas(j.data);
      })
      .catch(() => {})
      .finally(() => setAreasLoading(false));
  }, []);

  const loadShippingPrice = useCallback(
    (cityId: string, zoneId: string, itemWeight: number) => {
      if (!cityId || !zoneId) {
        setShippingPrice(null);
        setShippingPriceError(null);
        return;
      }
      setShippingPriceLoading(true);
      setShippingPrice(null);
      setShippingPriceError(null);
      fetch("/api/pathao/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: Number(cityId),
          zone_id: Number(zoneId),
          item_weight: itemWeight,
        }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (j.success && typeof j.price === "number") {
            setShippingPrice(j.price);
            setShippingPriceError(null);
          } else {
            setShippingPriceError(j.error || "Could not get shipping rate");
          }
        })
        .catch(() => {
          setShippingPriceError("Could not load shipping rate");
        })
        .finally(() => setShippingPriceLoading(false));
    },
    []
  );

  useEffect(() => {
    if (formData.zoneId && formData.cityId) {
      loadShippingPrice(formData.cityId, formData.zoneId, cartWeightKg);
    } else {
      setShippingPrice(null);
      setShippingPriceError(null);
    }
  }, [formData.cityId, formData.zoneId, cartWeightKg, loadShippingPrice]);

  const copyToClipboard = (text: string, field: "order" | "tracking") => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const subtotal = getTotal();
    const pathaoShipping = shippingPrice ?? 0;
    // Pathao keeps 1% of amount collected as COD fee. So we set amount_to_collect
    // so that after 1% deduction we receive subtotal + delivery: 0.99 * total = subtotal + delivery
    const total = Math.round((subtotal + pathaoShipping) / 0.99 * 100) / 100;
    const shippingCost = total - subtotal; // delivery + COD fee (what customer pays on top of products)

    const payload = {
      email: formData.email,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      ...(formData.secondaryPhone.trim() && {
        secondaryPhone: formData.secondaryPhone.trim(),
      }),
      address: formData.address.trim(),
      city_id: Number(formData.cityId),
      zone_id: Number(formData.zoneId),
      area_id: formData.areaId ? Number(formData.areaId) : 0,
      city_name: formData.cityName,
      zone_name: formData.zoneName,
      area_name: formData.areaName || "",
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      shipping: shippingCost,
      total,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order. Please try again.");
        setLoading(false);
        return;
      }

      setOrderId(data.orderId ?? null);
      setPathaoConsignmentId(data.pathaoConsignmentId ?? null);
      setOrderPhone(formData.phone.trim() || null);
      setPathaoError(data.pathaoError ?? null);
      setOrderPlaced(true);
      clearCart(); // Empty cart as soon as order is placed
      addOrder({
        orderId: data.orderId,
        date: new Date().toISOString(),
        pathaoConsignmentId: data.pathaoConsignmentId ?? null,
        orderPhone: formData.phone.trim() || null,
        total,
        itemsSummary: items.map((i) => `${i.name} × ${i.quantity}`).join(" | "),
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Normalize phone for Pathao tracking URL (11 digits, 01...)
  const trackingPhone =
    orderPhone != null
      ? orderPhone.replace(/\D/g, "").replace(/^(\d{10})$/, "0$1").slice(0, 11)
      : null;
  const pathaoTrackingUrl =
    pathaoConsignmentId && trackingPhone && trackingPhone.length === 11
      ? `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(pathaoConsignmentId)}&phone=${encodeURIComponent(trackingPhone)}`
      : null;

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="min-h-[80vh]">
          <SectionContainer>
            <div className="mx-auto max-w-2xl">
              {/* Success hero - animated completed icon */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/30 ring-4 ring-[hsl(var(--primary))]/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 1],
                    opacity: 1,
                  }}
                  transition={{
                    scale: {
                      times: [0, 0.6, 1],
                      duration: 0.5,
                    },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      boxShadow: [
                        "0 0 0 0 rgba(255,255,255,0.4)",
                        "0 0 0 8px rgba(255,255,255,0)",
                      ],
                    }}
                    transition={{
                      scale: { delay: 0.15, duration: 0.25, ease: "easeOut" },
                      opacity: { delay: 0.1, duration: 0.2 },
                      boxShadow: { delay: 0.4, duration: 0.6, repeat: Infinity, repeatDelay: 1.5 },
                    }}
                    className="flex items-center justify-center rounded-full"
                  >
                    <Check className="h-10 w-10 text-white" strokeWidth={2.5} aria-hidden />
                  </motion.div>
                </motion.div>
                <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Order confirmed
                </h1>
                <p className="mb-8 max-w-md text-base text-gray-600">
                  We&apos;ll get your order to you soon. Pay when it arrives—cash on delivery.
                </p>
              </div>

              {pathaoError && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-left text-sm text-amber-800">
                  <strong>Note:</strong> Your order is confirmed, but we couldn&apos;t create the Pathao delivery automatically. We&apos;ll arrange delivery and contact you soon.
                  <details className="mt-2">
                    <summary className="cursor-pointer text-amber-700">Technical details</summary>
                    <pre className="mt-1 overflow-auto text-xs">{pathaoError}</pre>
                  </details>
                </div>
              )}

              {/* Order Summary card - both IDs in one line with individual copy buttons */}
              {(orderId || pathaoConsignmentId) && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
                  <div className="border-b border-gray-200/80 bg-white px-4 py-4 sm:px-5">
                    <h2 className="text-base font-bold text-gray-900 sm:text-lg">Order Summary</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
                    {orderId && (
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
                        <span className="shrink-0 text-sm font-medium text-gray-600">Order ID</span>
                        <span className="min-w-0 truncate font-mono text-sm font-semibold text-gray-900 tracking-tight">
                          {orderId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(orderId, "order")}
                          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1"
                          aria-label="Copy order ID"
                        >
                          {copiedField === "order" ? (
                            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>
                    )}
                    {pathaoConsignmentId && (
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
                        <span className="shrink-0 text-sm font-medium text-gray-600">Tracking ID</span>
                        <span className="min-w-0 truncate font-mono text-sm font-semibold text-gray-900 tracking-tight">
                          {pathaoConsignmentId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pathaoConsignmentId, "tracking")}
                          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1"
                          aria-label="Copy tracking ID"
                        >
                          {copiedField === "tracking" ? (
                            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-5">
                    {pathaoTrackingUrl && (
                      <a
                        href={pathaoTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                        Track Delivery
                      </a>
                    )}
                  </div>
                </div>
              )}

              {pathaoTrackingUrl && (
                <p className="mb-6 text-center text-sm font-medium text-emerald-600">
                  Your order is confirmed and in transit.
                </p>
              )}

              <div className="flex flex-col items-center sm:flex-row sm:justify-center">
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main>
          <SectionContainer>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
                Your cart is empty
              </h1>
              <p className="mb-8 text-lg text-gray-600">
                Add some spicy goodness to your cart!
              </p>
              <Link href="/shop">
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <h1 className="mb-8 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
            Checkout
          </h1>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* City, Zone, Area — one row first */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <select
                          value={formData.cityId}
                          onChange={(e) => {
                            const opt = e.target.options[e.target.selectedIndex];
                            const name = opt?.text ?? "";
                            setFormData((prev) => ({
                              ...prev,
                              cityId: e.target.value,
                              cityName: name,
                              zoneId: "",
                              zoneName: "",
                              areaId: "",
                              areaName: "",
                            }));
                            loadZones(e.target.value);
                          }}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select city</option>
                          {citiesLoading && <option disabled>Loading...</option>}
                          {cities.map((c) => (
                            <option key={c.city_id} value={c.city_id}>
                              {c.city_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Zone</label>
                        <select
                          value={formData.zoneId}
                          onChange={(e) => {
                            const opt = e.target.options[e.target.selectedIndex];
                            const name = opt?.text ?? "";
                            setFormData((prev) => ({
                              ...prev,
                              zoneId: e.target.value,
                              zoneName: name,
                              areaId: "",
                              areaName: "",
                            }));
                            loadAreas(e.target.value);
                          }}
                          required
                          disabled={!formData.cityId || zonesLoading}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                        >
                          <option value="">Select zone</option>
                          {zonesLoading && <option disabled>Loading...</option>}
                          {zones.map((z) => (
                            <option key={z.zone_id} value={z.zone_id}>
                              {z.zone_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Area</label>
                        <select
                          value={formData.areaId}
                          onChange={(e) => {
                            const opt = e.target.options[e.target.selectedIndex];
                            setFormData((prev) => ({
                              ...prev,
                              areaId: e.target.value,
                              areaName: opt?.text ?? "",
                            }));
                          }}
                        disabled={!formData.zoneId || areasLoading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      >
                        <option value="">Select area (optional)</option>
                          {areasLoading && <option disabled>Loading...</option>}
                          {areas.map((a) => (
                            <option key={a.area_id} value={a.area_id}>
                              {a.area_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Detailed address
                      </label>
                      <Input
                        type="text"
                        placeholder="House, road, block, landmark (e.g. House Ka-167/A, Land Office Road, Bottola)"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>

                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="tel"
                          placeholder="Phone (e.g. 01712345678)"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          minLength={11}
                          maxLength={14}
                          required
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecondaryPhone((v) => !v)}
                          className="whitespace-nowrap text-sm font-medium text-[hsl(var(--primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
                        >
                          {showSecondaryPhone ? "− Remove" : "+ Add Secondary Number"}
                        </button>
                      </div>
                      {showSecondaryPhone && (
                        <Input
                          type="tel"
                          placeholder="Secondary phone (optional)"
                          value={formData.secondaryPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, secondaryPhone: e.target.value })
                          }
                          minLength={11}
                          maxLength={14}
                          className="max-w-xs"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-sm text-gray-600">
                  Payment: <strong>Cash on delivery</strong>—pay when your order arrives.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border-b border-border pb-4"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(getTotal())}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">
                          {shippingPriceLoading
                            ? "Calculating..."
                            : shippingPrice != null
                              ? formatPrice(
                                  (getTotal() + (shippingPrice ?? 0)) / 0.99 -
                                    getTotal()
                                )
                              : formData.cityId && formData.zoneId
                                ? "—"
                                : "Select City & Zone"}
                        </span>
                      </div>
                      {shippingPriceError && (
                        <p className="text-xs text-amber-600">
                          {shippingPriceError}. You can still place the order.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {formatPrice(
                          shippingPrice != null
                            ? Math.round(
                                (getTotal() + (shippingPrice ?? 0)) / 0.99 * 100
                              ) / 100
                            : getTotal()
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    type="submit"
                    disabled={loading || shippingPriceLoading}
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

