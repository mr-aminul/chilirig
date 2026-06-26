import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order-number";
import { getSupabaseAdmin } from "@/lib/supabase-server";

interface RouteContext {
  params: { id: string };
}

const NEW_ORDER_FIELDS =
  "id, order_number, full_name, email, phone, secondary_phone, address, city_id, zone_id, area_id, city_name, zone_name, area_name, subtotal, shipping, total, status, pathao_consignment_id, pathao_error, created_at";

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

    const { data: source, error: sourceError } = await supabase
      .from("orders")
      .select(
        "full_name, email, phone, secondary_phone, address, city_id, zone_id, area_id, city_name, zone_name, area_name, subtotal, shipping, total"
      )
      .eq("id", id)
      .maybeSingle();

    if (sourceError) {
      console.error("Admin order duplicate lookup error:", sourceError);
      return NextResponse.json(
        { success: false, error: "Failed to load order" },
        { status: 500 }
      );
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const { data: sourceItems, error: sourceItemsError } = await supabase
      .from("order_items")
      .select("product_id, product_name, unit_price, quantity")
      .eq("order_id", id);

    if (sourceItemsError) {
      console.error("Admin order duplicate items lookup error:", sourceItemsError);
      return NextResponse.json(
        { success: false, error: "Failed to load order items" },
        { status: 500 }
      );
    }

    const { data: newOrder, error: insertError } = await supabase
      .from("orders")
      .insert({
        order_number: generateOrderNumber(),
        email: source.email,
        full_name: source.full_name,
        phone: source.phone,
        secondary_phone: source.secondary_phone,
        address: source.address,
        city_id: source.city_id,
        zone_id: source.zone_id,
        area_id: source.area_id,
        city_name: source.city_name,
        zone_name: source.zone_name,
        area_name: source.area_name,
        subtotal: source.subtotal,
        shipping: source.shipping,
        total: source.total,
        status: "new",
        pathao_consignment_id: null,
        pathao_error: null,
      })
      .select(NEW_ORDER_FIELDS)
      .single();

    if (insertError || !newOrder) {
      console.error("Admin order duplicate insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to re-create order" },
        { status: 502 }
      );
    }

    let newItems: Array<{
      id: string;
      product_name: string;
      unit_price: number;
      quantity: number;
    }> = [];

    if (sourceItems && sourceItems.length > 0) {
      const itemsPayload = sourceItems.map((item) => ({
        order_id: newOrder.id,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
      }));

      const { data: insertedItems, error: itemsInsertError } = await supabase
        .from("order_items")
        .insert(itemsPayload)
        .select("id, product_name, unit_price, quantity");

      if (itemsInsertError) {
        console.error("Admin order duplicate items insert error:", itemsInsertError);
      } else {
        newItems = insertedItems ?? [];
      }
    }

    return NextResponse.json({
      success: true,
      order: { ...newOrder, items: newItems },
    });
  } catch (error) {
    console.error("Admin order duplicate API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to re-create order" },
      { status: 500 }
    );
  }
}
