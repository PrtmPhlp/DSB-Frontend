import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.home.pertermann.de";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Validiere das Token durch einen Aufruf des healthcheck-Endpunkts mit dem Token
    // Das ist eine einfache Möglichkeit der Tokenvalidierung ohne extra Endpunkt
    try {
      const response = await fetch(`${API_URL}/healthcheck`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      // HTTP 2xx Status bedeutet erfolgreich
      if (response.ok) {
        return NextResponse.json({ authenticated: true });
      } else {
        // Token ist nicht mehr gültig, lösche es
        cookieStore.delete("auth_token");
        return NextResponse.json({ authenticated: false });
      }
    } catch (error) {
      console.error("API validation error:", error);
      return NextResponse.json({ authenticated: false });
    }
  } catch (e) {
    console.error("Authentication status error:", e);
    return NextResponse.json(
      { authenticated: false, error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
}
