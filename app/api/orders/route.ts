import { NextRequest, NextResponse } from "next/server";
import {
  createPathaoOrder,
  normalizePathaoPhone,
} from "@/lib/pathao";

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

function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CR-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderPayload;

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

    if (
      !email ||
      !fullName ||
      !phone ||
      !address ||
      city_id == null ||
      zone_id == null ||
      !city_name ||
      !zone_name ||
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof subtotal !== "number" ||
      typeof total !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid order fields (include City & Zone)" },
        { status: 400 }
      );
    }

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
    const itemsSummary = items
      .map((i) => `${i.name} × ${i.quantity}`)
      .join(" | ");
    const shippingCost = typeof shipping === "number" ? shipping : 0;
    const totalWeight = Math.max(0.5, items.reduce((sum, i) => sum + i.quantity * 0.5, 0));

    // Create Pathao Courier delivery order first so we can save consignment ID to the sheet
    let pathaoConsignmentId: string | null = null;
    let pathaoError: string | null = null;

    const storeId = process.env.PATHAO_STORE_ID;
    if (
      storeId &&
      process.env.PATHAO_CLIENT_ID &&
      process.env.PATHAO_CLIENT_SECRET &&
      process.env.PATHAO_USERNAME &&
      process.env.PATHAO_PASSWORD
    ) {
      const recipientAddress = [address, area_name, zone_name, city_name]
        .filter(Boolean)
        .join(", ");
      if (recipientAddress.length < 10 || recipientAddress.length > 220) {
        pathaoError = "Address length must be between 10 and 220 characters for Pathao";
      } else {
        const secondaryPhoneNorm = secondaryPhone
          ? normalizePathaoPhone(secondaryPhone)
          : undefined;
        const pathaoSecondary =
          secondaryPhoneNorm &&
          secondaryPhoneNorm.length === 11 &&
          secondaryPhoneNorm.startsWith("01")
            ? secondaryPhoneNorm
            : undefined;

        try {
          const pathaoRes = await createPathaoOrder({
            store_id: parseInt(storeId, 10),
            merchant_order_id: orderId,
            recipient_name: fullName.trim(),
            recipient_phone: recipientPhone,
            ...(pathaoSecondary && { recipient_secondary_phone: pathaoSecondary }),
            recipient_address: recipientAddress,
            recipient_city: Number(city_id),
            recipient_zone: Number(zone_id),
            ...(area_id != null && area_id !== 0 && { recipient_area: Number(area_id) }),
            delivery_type: 48,
            item_type: 2,
            item_quantity: 1,
            item_weight: String(totalWeight),
            amount_to_collect: Math.round(total),
            item_description:
              itemsSummary.length <= 220 ? itemsSummary : `Order ${orderId}`,
          });
          pathaoConsignmentId = pathaoRes.data?.consignment_id ?? null;
          console.log("[Orders] Pathao order created:", pathaoConsignmentId);
        } catch (err) {
          pathaoError = err instanceof Error ? err.message : String(err);
          console.error("[Orders] Pathao failed:", pathaoError);
        }
      }
    }

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
      pathaoConsignmentId: pathaoConsignmentId ?? "",
    };

    const scriptUrl = process.env.GOOGLE_SCRIPT_ORDERS_URL;
    if (scriptUrl) {
      const res = await fetch(scriptUrl, {
        method: "POST",
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
      ...(pathaoConsignmentId && { pathaoConsignmentId }),
      ...(pathaoError && { pathaoError }),
    });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order" },
      { status: 500 }
    );
  }
}
