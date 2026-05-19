import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const ORDER_FIELDS =
  "id, order_number, full_name, email, phone, secondary_phone, address, city_id, zone_id, area_id, city_name, zone_name, area_name, subtotal, shipping, total, status, pathao_consignment_id, pathao_error, created_at";

const ORDER_ITEM_FIELDS = "id, order_id, product_name, unit_price, quantity";

const ORDER_SELECT = `${ORDER_FIELDS}, order_items (${ORDER_ITEM_FIELDS})`;

type OrderItemRow = {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
};

type OrderRow = Record<string, unknown> & {
  id: string;
  order_items?: OrderItemRow[] | null;
};

function mapOrder(row: OrderRow) {
  const { order_items, ...order } = row;
  return {
    ...order,
    items: Array.isArray(order_items) ? order_items : [],
  };
}

async function attachOrderItems(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  orders: OrderRow[]
) {
  if (orders.length === 0) return orders.map(mapOrder);

  const orderIds = orders.map((o) => o.id);
  const { data: items, error } = await supabase
    .from("order_items")
    .select(ORDER_ITEM_FIELDS)
    .in("order_id", orderIds);

  if (error) {
    console.error("Admin order items fetch error:", error);
    return orders.map((o) => mapOrder({ ...o, order_items: [] }));
  }

  const byOrderId = new Map<string, OrderItemRow[]>();
  for (const item of items ?? []) {
    const orderId = (item as OrderItemRow & { order_id: string }).order_id;
    if (!orderId) continue;
    const list = byOrderId.get(orderId) ?? [];
    list.push(item as OrderItemRow);
    byOrderId.set(orderId, list);
  }

  return orders.map((order) =>
    mapOrder({
      ...order,
      order_items: byOrderId.get(order.id) ?? [],
    })
  );
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const supabase = getSupabaseAdmin();

    let result = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false });

    if (result.error?.message?.toLowerCase().includes("created_at")) {
      result = await supabase.from("orders").select(ORDER_SELECT);
    }

    let orders: ReturnType<typeof mapOrder>[];

    if (result.error) {
      const needsSeparateItems =
        result.error.message?.toLowerCase().includes("order_items") ||
        result.error.message?.toLowerCase().includes("relationship");

      if (!needsSeparateItems) {
        console.error("Admin orders fetch error:", result.error);
        return NextResponse.json(
          { success: false, error: "Failed to load orders" },
          { status: 500 }
        );
      }

      let fallback = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .order("created_at", { ascending: false });

      if (fallback.error?.message?.toLowerCase().includes("created_at")) {
        fallback = await supabase.from("orders").select(ORDER_FIELDS);
      }

      if (fallback.error) {
        console.error("Admin orders fetch error:", fallback.error);
        return NextResponse.json(
          { success: false, error: "Failed to load orders" },
          { status: 500 }
        );
      }

      orders = await attachOrderItems(supabase, (fallback.data ?? []) as OrderRow[]);
    } else {
      orders = (result.data ?? []).map((row) => mapOrder(row as OrderRow));
    }

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
