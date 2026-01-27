import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get expected password from environment variable
    const expectedPassword = process.env.ADMIN_PASSWORD || "chiliadminrig32";

    // Check if password matches
    if (password === expectedPassword) {
      // Set authentication cookie (expires in 7 days)
      const cookieStore = await cookies();
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      // Set cookie in response
      response.cookies.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid password",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process login",
      },
      { status: 500 }
    );
  }
}
