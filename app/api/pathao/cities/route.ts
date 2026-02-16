import { NextResponse } from "next/server";
import { getPathaoCities } from "@/lib/pathao";

export async function GET() {
  try {
    const cities = await getPathaoCities();
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Pathao cities]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
