import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Count of orders not yet sent to Pathao (same rule as admin orders page). */
export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .is("pathao_consignment_id", null);

    if (error) {
      console.error("Pending order count error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to count orders" },
        { status: 500, headers: NO_STORE }
      );
    }

    return NextResponse.json(
      { success: true, count: count ?? 0 },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("Pending order count API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to count orders" },
      { status: 500, headers: NO_STORE }
    );
  }
}
