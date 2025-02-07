import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Clear the token cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "authToken",
      value: "",
      maxAge: 0,
      httpOnly: true,
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
