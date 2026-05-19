import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isOrderCancelled, ORDER_STATUS_CANCELLED } from "@/lib/order-status";
import { getSupabaseAdmin } from "@/lib/supabase-server";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { data: existing, error: lookupError } = await supabase
      .from("orders")
      .select("id, status, pathao_consignment_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Admin order cancel lookup error:", lookupError);
      return NextResponse.json(
        { success: false, error: "Failed to load order" },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (isOrderCancelled(existing.status)) {
      return NextResponse.json(
        { success: false, error: "Order is already cancelled" },
        { status: 409 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: ORDER_STATUS_CANCELLED })
      .eq("id", id)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("Admin order cancel error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to cancel order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin order cancel API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", id);
    if (itemsError) {
      console.error("Admin order items delete error:", itemsError);
      return NextResponse.json(
        { success: false, error: "Failed to delete order items" },
        { status: 500 }
      );
    }

    const { data: deletedOrder, error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (orderError) {
      console.error("Admin order delete error:", orderError);
      return NextResponse.json(
        { success: false, error: "Failed to delete order" },
        { status: 500 }
      );
    }

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin order delete API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
