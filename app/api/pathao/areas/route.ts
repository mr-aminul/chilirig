import { NextRequest, NextResponse } from "next/server";
import { getPathaoAreas } from "@/lib/pathao";

export async function GET(request: NextRequest) {
  const zoneId = request.nextUrl.searchParams.get("zone_id");
  if (!zoneId) {
    return NextResponse.json(
      { success: false, error: "zone_id is required" },
      { status: 400 }
    );
  }
  const id = parseInt(zoneId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid zone_id" },
      { status: 400 }
    );
  }
  try {
    const areas = await getPathaoAreas(id);
    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Pathao areas]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
