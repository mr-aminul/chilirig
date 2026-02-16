import { NextRequest, NextResponse } from "next/server";
import { getPathaoZones } from "@/lib/pathao";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("city_id");
  if (!cityId) {
    return NextResponse.json(
      { success: false, error: "city_id is required" },
      { status: 400 }
    );
  }
  const id = parseInt(cityId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid city_id" },
      { status: 400 }
    );
  }
  try {
    const zones = await getPathaoZones(id);
    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Pathao zones]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
