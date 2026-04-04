"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart, useOrders } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Minus, Plus, Trash2, Copy, Check, Banknote } from "lucide-react";
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

type CheckoutFieldKey =
  | "cityId"
  | "zoneId"
  | "areaId"
  | "address"
  | "fullName"
  | "email"
  | "phone"
  | "secondaryPhone";

interface CheckoutErrorState {
  title: string;
  message: string;
  field?: CheckoutFieldKey;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CheckoutErrorState | null>(null);
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
  const [copiedField, setCopiedField] = useState<"order" | null>(null);
  const fieldRefs = useRef<
    Partial<Record<CheckoutFieldKey, HTMLInputElement | HTMLSelectElement | null>>
  >({});

  const cartWeightKg = Math.max(0.5, items.reduce((sum, i) => sum + i.quantity * 0.5, 0));

  const formatFieldList = (fields: string[]) => {
    if (fields.length <= 1) return fields[0] ?? "";
    if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
    return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`;
  };

  const getPhoneDigits = (value: string) => value.replace(/\D/g, "");

  const focusField = useCallback(
    (field: CheckoutFieldKey) => {
      const runFocus = () => {
        const el = fieldRefs.current[field];
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => el.focus(), 120);
      };

      if (field === "secondaryPhone" && !showSecondaryPhone) {
        setShowSecondaryPhone(true);
        window.setTimeout(runFocus, 50);
        return;
      }

      runFocus();
    },
    [showSecondaryPhone]
  );

  const getCheckoutValidationError = () => {
    const missingFields: Array<{ key: CheckoutFieldKey; label: string }> = [];

    if (!formData.fullName.trim()) missingFields.push({ key: "fullName", label: "Full name" });
    if (!formData.email.trim()) missingFields.push({ key: "email", label: "Email" });
    if (!formData.phone.trim()) missingFields.push({ key: "phone", label: "Phone" });
    if (!formData.address.trim()) {
      missingFields.push({ key: "address", label: "Detailed address" });
    }
    if (!formData.cityId) missingFields.push({ key: "cityId", label: "City" });
    if (!formData.zoneId) missingFields.push({ key: "zoneId", label: "Zone" });

    if (missingFields.length > 0) {
      return {
        title: "Complete the missing fields",
        message: `Please fill in ${formatFieldList(missingFields.map((field) => field.label))}. We’ve taken you to the first field that needs attention.`,
        field: missingFields[0].key,
      };
    }

    const email = formData.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        title: "Enter a valid email address",
        message: "Please check the Email field and use a valid address like name@example.com. We’ve moved you to that field.",
        field: "email" as const,
      };
    }

    const phoneDigits = getPhoneDigits(formData.phone);
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith("01")) {
      return {
        title: "Check your phone number",
        message: "Please enter an 11-digit Bangladeshi mobile number in the Phone field, for example 01712345678. We’ve taken you there now.",
        field: "phone" as const,
      };
    }

    if (showSecondaryPhone && formData.secondaryPhone.trim()) {
      const secondaryPhoneDigits = getPhoneDigits(formData.secondaryPhone);
      if (secondaryPhoneDigits.length !== 11 || !secondaryPhoneDigits.startsWith("01")) {
        return {
          title: "Check the secondary phone number",
          message: "Please use an 11-digit Bangladeshi mobile number for the secondary phone, or remove that field if you do not need it. We’ve opened that field for you.",
          field: "secondaryPhone" as const,
        };
      }
    }

    if (shippingPriceLoading) {
      return {
        title: "Shipping is still being calculated",
        message: "Please wait a moment for the shipping cost to finish loading after selecting City and Zone, then place your order again.",
        field: "zoneId" as const,
      };
    }

    return null;
  };

  useEffect(() => {
    fetch("/api/pathao/cities", { cache: "no-store" })
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
    fetch(`/api/pathao/zones?city_id=${encodeURIComponent(cityId)}`, { cache: "no-store" })
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
    fetch(`/api/pathao/areas?zone_id=${encodeURIComponent(zoneId)}`, { cache: "no-store" })
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
        cache: "no-store",
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

  const copyToClipboard = (text: string, field: "order") => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = getCheckoutValidationError();
    if (validationError) {
      setError(validationError);
      if (validationError.field) {
        focusField(validationError.field);
      }
      return;
    }

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
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError({
          title: "We couldn't place your order",
          message:
            data.error ||
            "Please review your delivery details, especially City, Zone, phone number, and address, then try again.",
        });
        setLoading(false);
        return;
      }

      setOrderId(data.orderId ?? null);
      setOrderPlaced(true);
      clearCart(); // Empty cart as soon as order is placed
      addOrder({
        orderId: data.orderId,
        date: new Date().toISOString(),
        pathaoConsignmentId: null,
        orderPhone: null,
        total,
        itemsSummary: items.map((i) => `${i.name} × ${i.quantity}`).join(" | "),
      });
    } catch {
      setError({
        title: "Connection problem",
        message:
          "Your order was not submitted. Please check your internet connection and try again. If the problem continues, refresh the page and resubmit.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/30 ring-4 ring-[hsl(var(--primary))]/20 sm:mb-6 sm:h-20 sm:w-20"
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
                    <Check className="h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={2.5} aria-hidden />
                  </motion.div>
                </motion.div>
                <h1 className="mb-3 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Order confirmed
                </h1>
                <p className="mb-6 max-w-md text-sm text-gray-600 sm:mb-8 sm:text-base">
                  We&apos;ll get your order to you soon. Pay when it arrives—cash on delivery.
                </p>
              </div>

              {orderId && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
                  <div className="border-b border-gray-200/80 bg-white px-4 py-4 sm:px-5">
                    <h2 className="text-base font-bold text-gray-900 sm:text-lg">Order Summary</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
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
                  </div>
                </div>
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
              <h1 className="mb-4 font-display text-3xl font-bold text-gray-900 sm:text-5xl">
                Your cart is empty
              </h1>
              <p className="mb-8 text-base text-gray-600 sm:text-lg">
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
          <h1 className="mb-6 font-display text-3xl font-bold text-gray-900 sm:mb-8 sm:text-5xl">
            Checkout
          </h1>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="fixed inset-x-4 top-20 z-40 rounded-xl border border-destructive/50 bg-white px-4 py-3 text-sm text-destructive shadow-lg sm:static sm:mb-6 sm:rounded-lg sm:bg-destructive/10 sm:shadow-none"
                >
                  <p className="font-semibold text-destructive">{error.title}</p>
                  <p className="mt-1 leading-relaxed text-destructive/90">{error.message}</p>
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Shipping Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        ref={(el) => {
                          fieldRefs.current.fullName = el;
                        }}
                        type="text"
                        placeholder="Full name"
                        aria-label="Full name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                        className="h-11 text-sm"
                      />
                      <Input
                        ref={(el) => {
                          fieldRefs.current.email = el;
                        }}
                        type="email"
                        placeholder="Email address"
                        aria-label="Email address"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          ref={(el) => {
                            fieldRefs.current.phone = el;
                          }}
                          type="tel"
                          placeholder="Primary phone number"
                          aria-label="Primary phone number"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          minLength={11}
                          maxLength={14}
                          required
                          className="h-11 flex-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecondaryPhone((v) => !v)}
                          className="rounded px-2 py-1 text-left text-sm font-medium text-[hsl(var(--primary))] hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:whitespace-nowrap"
                        >
                          {showSecondaryPhone ? "− Remove" : "+ Add Secondary Number"}
                        </button>
                      </div>
                      {showSecondaryPhone && (
                        <Input
                          ref={(el) => {
                            fieldRefs.current.secondaryPhone = el;
                          }}
                          type="tel"
                          placeholder="Secondary phone number (optional)"
                          aria-label="Secondary phone number"
                          value={formData.secondaryPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, secondaryPhone: e.target.value })
                          }
                          minLength={11}
                          maxLength={14}
                          className="h-11 max-w-full text-sm sm:max-w-xs"
                        />
                      )}
                    </div>

                    {/* City, Zone, Area */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                      <div>
                        <select
                          ref={(el) => {
                            fieldRefs.current.cityId = el;
                          }}
                          aria-label="City"
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
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">City</option>
                          {citiesLoading && <option disabled>Loading...</option>}
                          {cities.map((c) => (
                            <option key={c.city_id} value={c.city_id}>
                              {c.city_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          ref={(el) => {
                            fieldRefs.current.zoneId = el;
                          }}
                          aria-label="Zone"
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
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                        >
                          <option value="">Zone</option>
                          {zonesLoading && <option disabled>Loading...</option>}
                          {zones.map((z) => (
                            <option key={z.zone_id} value={z.zone_id}>
                              {z.zone_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <select
                          ref={(el) => {
                            fieldRefs.current.areaId = el;
                          }}
                          aria-label="Area"
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
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                        >
                          <option value="">Area (optional)</option>
                          {areasLoading && <option disabled>Loading...</option>}
                          {areas.map((a) => (
                            <option key={a.area_id} value={a.area_id}>
                              {a.area_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Input
                        ref={(el) => {
                          fieldRefs.current.address = el;
                        }}
                        type="text"
                        placeholder="Detailed address, house/road/block, landmark"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        className="h-11 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

              </form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="lg:sticky lg:top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 border-b border-border pb-4"
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
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-gray-900">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-3 flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-7 text-center text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
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
                              className="ml-auto h-8 w-8"
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/shop" className="block">
                    <Button variant="outline" className="w-full">
                      Add more
                    </Button>
                  </Link>
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
                    <div className="flex justify-between border-t border-border pt-2 text-base font-bold sm:text-lg">
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
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                      <Banknote className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-900">
                        Cash on delivery
                      </p>
                      <p className="text-xs text-emerald-800">
                        Pay when it arrives.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="h-11 w-full text-sm sm:h-12 sm:text-base"
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

