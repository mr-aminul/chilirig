import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Delete cookie
    response.cookies.delete("admin-auth");

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
