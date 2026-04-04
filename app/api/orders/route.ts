import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePathaoPhone } from "@/lib/pathao";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export interface OrderItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  email: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  city_id: number;
  zone_id: number;
  area_id: number;
  city_name: string;
  zone_name: string;
  area_name: string;
  items: OrderItemPayload[];
  subtotal: number;
  shipping: number;
  total: number;
}

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

const orderPayloadSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  secondaryPhone: z.string().min(8).optional(),
  address: z.string().min(5),
  city_id: z.number().int().nonnegative(),
  zone_id: z.number().int().nonnegative(),
  area_id: z.number().int().nonnegative(),
  city_name: z.string().min(1),
  zone_name: z.string().min(1),
  area_name: z.string(),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CR-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = orderPayloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid order payload" },
        { status: 400 }
      );
    }
    const body = parsed.data as OrderPayload;

    const {
      email,
      fullName,
      phone,
      secondaryPhone,
      address,
      city_id,
      zone_id,
      area_id,
      city_name,
      zone_name,
      area_name,
      items,
      subtotal,
      shipping,
      total,
    } = body;

    const recipientPhone = normalizePathaoPhone(phone);
    if (recipientPhone.length !== 11 || !recipientPhone.startsWith("01")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712345678)",
        },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const itemsSummary = items.map((i) => `${i.name} × ${i.quantity}`).join(" | ");
    const shippingCost = typeof shipping === "number" ? shipping : 0;

    const row = {
      orderId,
      date: new Date().toISOString(),
      email,
      fullName,
      phone: recipientPhone,
      secondaryPhone: secondaryPhone ? normalizePathaoPhone(secondaryPhone) : "",
      address,
      city: city_name,
      zone: zone_name,
      area: area_name,
      items: itemsSummary,
      subtotal,
      shipping: shippingCost,
      total,
      status: "New",
      pathaoConsignmentId: "",
    };

    const supabase = getSupabaseAdmin();
    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        order_number: orderId,
        email,
        full_name: fullName,
        phone: recipientPhone,
        secondary_phone: secondaryPhone ? normalizePathaoPhone(secondaryPhone) : null,
        address,
        city_id,
        zone_id,
        area_id: area_id || null,
        city_name,
        zone_name,
        area_name,
        subtotal,
        shipping: shippingCost,
        total,
        status: "new",
        pathao_consignment_id: null,
        pathao_error: null,
      })
      .select("id")
      .single();

    if (orderInsertError) {
      console.error("Supabase order insert error:", orderInsertError);
      return NextResponse.json(
        { success: false, error: "Failed to save order" },
        { status: 502 }
      );
    }

    const orderItemsPayload = items.map((item) => ({
      order_id: insertedOrder.id,
      product_id: null,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
    }));

    if (orderItemsPayload.length > 0) {
      const { error: itemsInsertError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);
      if (itemsInsertError) {
        console.error("Supabase order items insert error:", itemsInsertError);
      }
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_ORDERS_URL;
    if (scriptUrl) {
      const res = await fetch(scriptUrl, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Google Apps Script error:", res.status, text);
        return NextResponse.json(
          { success: false, error: "Failed to save order to sheet" },
          { status: 502 }
        );
      }
    } else {
      // No sheet configured: log only (useful for local/dev)
      console.log("[Orders] No GOOGLE_SCRIPT_ORDERS_URL; order logged:", row);
    }

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order" },
      { status: 500 }
    );
  }
}
