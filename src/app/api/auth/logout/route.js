import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Mock logout - just return success
    // In real Supabase, this would invalidate the session
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
