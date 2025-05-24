import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.home.pertermann.de";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.msg || "Login failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create the response with the token
    const res = NextResponse.json({ success: true });

    // Set HTTP-only cookie with the token
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return res;
  } catch (e) {
    console.error("Authentication error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const res = NextResponse.json({ success: true });
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return res;
  } catch (e) {
    console.error("Logout error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
