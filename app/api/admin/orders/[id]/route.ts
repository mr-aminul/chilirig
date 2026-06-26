import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isOrderCancelled, ORDER_STATUS_CANCELLED } from "@/lib/order-status";
import { cancelPathaoOrder } from "@/lib/pathao";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function isPathaoConfigured(): boolean {
  return Boolean(
    process.env.PATHAO_CLIENT_ID &&
      process.env.PATHAO_CLIENT_SECRET &&
      process.env.PATHAO_USERNAME &&
      process.env.PATHAO_PASSWORD
  );
}

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

    const alreadyCancelled = isOrderCancelled(existing.status);
    const consignmentId = existing.pathao_consignment_id?.trim() || null;

    // A locally cancelled order with no consignment has nothing left to do.
    // One that still has a consignment may be "stranded" (cancelled before the
    // Pathao cancel existed), so we let it retry the Pathao cancel.
    if (alreadyCancelled && !consignmentId) {
      return NextResponse.json(
        { success: false, error: "Order is already cancelled" },
        { status: 409 }
      );
    }

    let pathaoCancelled = false;
    let pathaoAlreadyCancelled = false;

    if (consignmentId) {
      if (!isPathaoConfigured()) {
        return NextResponse.json(
          { success: false, error: "Pathao is not fully configured in environment variables" },
          { status: 500 }
        );
      }

      try {
        const result = await cancelPathaoOrder(consignmentId);
        pathaoCancelled = true;
        pathaoAlreadyCancelled = result.alreadyCancelled;
      } catch (error) {
        const pathaoError = error instanceof Error ? error.message : String(error);

        await supabase.from("orders").update({ pathao_error: pathaoError }).eq("id", id);

        console.error("Admin Pathao cancel failed:", pathaoError);
        return NextResponse.json(
          { success: false, error: pathaoError },
          { status: 502 }
        );
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: ORDER_STATUS_CANCELLED, pathao_error: null })
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

    if (pathaoCancelled) {
      // Best-effort: record that Pathao confirmed the cancellation so the
      // dashboard can show a truthful status. Ignored if the column is absent.
      const { error: timestampError } = await supabase
        .from("orders")
        .update({ pathao_cancelled_at: new Date().toISOString() })
        .eq("id", id);
      if (timestampError) {
        console.warn(
          "Could not set pathao_cancelled_at (run scripts/add_pathao_cancelled_at.sql):",
          timestampError.message
        );
      }
    }

    const message = pathaoCancelled
      ? pathaoAlreadyCancelled
        ? "Order cancelled. The Pathao shipment was already cancelled."
        : `Order cancelled and Pathao shipment ${consignmentId} cancelled.`
      : "Order cancelled.";

    return NextResponse.json({
      success: true,
      order: updated,
      pathaoCancelled,
      message,
    });
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

    const { data: existing, error: lookupError } = await supabase
      .from("orders")
      .select("id, status, pathao_consignment_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Admin order delete lookup error:", lookupError);
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

    const consignmentId = existing.pathao_consignment_id?.trim() || null;

    // Idempotent cancel means we can always try to revoke the shipment before
    // deleting, including for orders already cancelled locally but still live
    // on Pathao. Pathao treats an already-cancelled consignment as success.
    if (consignmentId) {
      if (!isPathaoConfigured()) {
        return NextResponse.json(
          { success: false, error: "Pathao is not fully configured in environment variables" },
          { status: 500 }
        );
      }

      try {
        await cancelPathaoOrder(consignmentId);
      } catch (error) {
        const pathaoError = error instanceof Error ? error.message : String(error);

        await supabase.from("orders").update({ pathao_error: pathaoError }).eq("id", id);

        console.error("Admin Pathao cancel (on delete) failed:", pathaoError);
        return NextResponse.json(
          { success: false, error: pathaoError },
          { status: 502 }
        );
      }
    }

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
