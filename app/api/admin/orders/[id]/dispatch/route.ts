import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createPathaoOrder, normalizePathaoPhone } from "@/lib/pathao";
import { getSupabaseAdmin } from "@/lib/supabase-server";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing order id" },
        { status: 400 }
      );
    }
    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, full_name, phone, secondary_phone, address, city_id, zone_id, area_id, city_name, zone_name, area_name, total, status, pathao_consignment_id"
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      console.error("Admin dispatch order lookup error:", orderError);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.pathao_consignment_id) {
      return NextResponse.json(
        { success: false, error: "Order already sent to Pathao" },
        { status: 409 }
      );
    }

    const storeId = process.env.PATHAO_STORE_ID;
    if (
      !storeId ||
      !process.env.PATHAO_CLIENT_ID ||
      !process.env.PATHAO_CLIENT_SECRET ||
      !process.env.PATHAO_USERNAME ||
      !process.env.PATHAO_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, error: "Pathao is not fully configured in environment variables" },
        { status: 500 }
      );
    }
    const parsedStoreId = Number.parseInt(storeId, 10);
    if (!Number.isFinite(parsedStoreId) || parsedStoreId <= 0) {
      return NextResponse.json(
        { success: false, error: "PATHAO_STORE_ID is invalid" },
        { status: 500 }
      );
    }

    const recipientPhone = normalizePathaoPhone(order.phone ?? "");
    if (recipientPhone.length !== 11 || !recipientPhone.startsWith("01")) {
      return NextResponse.json(
        {
          success: false,
          error: "Order phone number is not valid for Pathao dispatch",
        },
        { status: 400 }
      );
    }

    const secondaryPhoneNorm = order.secondary_phone
      ? normalizePathaoPhone(String(order.secondary_phone))
      : undefined;
    const recipientAddress = [
      order.address ? String(order.address) : "",
      order.area_name ? String(order.area_name) : "",
      order.zone_name ? String(order.zone_name) : "",
      order.city_name ? String(order.city_name) : "",
    ]
      .filter(Boolean)
      .join(", ");

    if (recipientAddress.length < 10 || recipientAddress.length > 220) {
      return NextResponse.json(
        {
          success: false,
          error: "Address length must be between 10 and 220 characters for Pathao",
        },
        { status: 400 }
      );
    }

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity")
      .eq("order_id", order.id);

    if (orderItemsError) {
      console.error("Admin dispatch order items lookup error:", orderItemsError);
      return NextResponse.json(
        { success: false, error: "Failed to load order items" },
        { status: 500 }
      );
    }

    const itemsSummary = (orderItems ?? [])
      .map((item) => `${item.product_name} × ${item.quantity}`)
      .join(" | ");
    const totalWeight = Math.max(
      0.5,
      (orderItems ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0) * 0.5, 0)
    );

    const recipientName = String(order.full_name ?? "").trim();
    if (recipientName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Order recipient name is missing or invalid" },
        { status: 400 }
      );
    }
    const recipientCity = Number(order.city_id);
    const recipientZone = Number(order.zone_id);
    const recipientArea = Number(order.area_id);
    if (!Number.isFinite(recipientCity) || !Number.isFinite(recipientZone)) {
      return NextResponse.json(
        { success: false, error: "Order city/zone is missing or invalid" },
        { status: 400 }
      );
    }

    try {
      const pathaoRes = await createPathaoOrder({
        store_id: parsedStoreId,
        merchant_order_id: String(order.order_number),
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        ...(secondaryPhoneNorm &&
        secondaryPhoneNorm.length === 11 &&
        secondaryPhoneNorm.startsWith("01")
          ? { recipient_secondary_phone: secondaryPhoneNorm }
          : {}),
        recipient_address: recipientAddress,
        recipient_city: recipientCity,
        recipient_zone: recipientZone,
        ...(order.area_id != null && Number.isFinite(recipientArea) && recipientArea !== 0
          ? { recipient_area: recipientArea }
          : {}),
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: String(totalWeight),
        amount_to_collect: Math.round(Number(order.total) || 0),
        item_description:
          itemsSummary.length > 0 && itemsSummary.length <= 220
            ? itemsSummary
            : `Order ${order.order_number}`,
      });

      const consignmentId = pathaoRes.data?.consignment_id ?? null;

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          pathao_consignment_id: consignmentId,
          pathao_error: null,
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Admin dispatch order update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Pathao order created, but saving consignment failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        consignmentId,
      });
    } catch (error) {
      const pathaoError = error instanceof Error ? error.message : String(error);

      await supabase
        .from("orders")
        .update({ pathao_error: pathaoError })
        .eq("id", order.id);

      console.error("Admin Pathao dispatch failed:", pathaoError);
      return NextResponse.json(
        { success: false, error: pathaoError },
        { status: 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Admin dispatch API error:", message);
    return NextResponse.json(
      { success: false, error: message || "Failed to dispatch order" },
      { status: 500 }
    );
  }
}
