import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete(ADMIN_AUTH_COOKIE_NAME);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to logout",
      },
      { status: 500 }
    );
  }
}
