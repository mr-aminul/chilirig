import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const ORDER_SELECT =
  "id, order_number, full_name, email, phone, secondary_phone, address, city_id, zone_id, area_id, city_name, zone_name, area_name, subtotal, shipping, total, status, pathao_consignment_id, pathao_error, created_at";

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

    if (result.error) {
      console.error("Admin orders fetch error:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to load orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: result.data ?? [],
    });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
