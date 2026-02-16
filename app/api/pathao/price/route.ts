import { NextRequest, NextResponse } from "next/server";
import { getPathaoPrice } from "@/lib/pathao";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city_id, zone_id, item_weight } = body as {
      city_id?: number;
      zone_id?: number;
      item_weight?: number;
    };
    if (city_id == null || zone_id == null) {
      return NextResponse.json(
        { success: false, error: "city_id and zone_id are required" },
        { status: 400 }
      );
    }
    const result = await getPathaoPrice({
      recipient_city: Number(city_id),
      recipient_zone: Number(zone_id),
      item_weight: item_weight != null ? Number(item_weight) : undefined,
    });
    return NextResponse.json({
      success: true,
      price: result.final_price,
      cod_enabled: result.cod_enabled,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Pathao price]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
