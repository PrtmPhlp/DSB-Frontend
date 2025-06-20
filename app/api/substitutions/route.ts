import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.home.pertermann.de";

// Cache-Zeit in Sekunden (5 Minuten)
const CACHE_TTL = 300;

// In-memory Cache für schnellere Antworten und Reduzierung der API-Aufrufe
// Im Produktionsbetrieb sollte dies durch eine richtige Caching-Lösung ersetzt werden
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
let dataCache: CacheEntry | null = null;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prüfe zuerst den Cache
    const currentTime = Math.floor(Date.now() / 1000);
    if (dataCache && currentTime - dataCache.timestamp < CACHE_TTL) {
      console.log("Serving from cache");
      return NextResponse.json(dataCache.data);
    }

    // Rufe Daten von der API ab, wenn kein gültiger Cache vorhanden ist
    const response = await fetch(`${API_URL}/api/`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      // AbortController für Timeouts hinzufügen
      signal: AbortSignal.timeout(10000), // 10 Sekunden Timeout
    });

    if (!response.ok) {
      // Spezifische Fehlerbehandlung basierend auf Status
      if (response.status === 401 || response.status === 403) {
        // Lösche das Token, da es vermutlich abgelaufen ist
        cookieStore.delete("auth_token");
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      }

      return NextResponse.json(
        { error: `Failed to fetch data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Speichere im Cache
    dataCache = {
      data,
      timestamp: currentTime,
    };

    // Setze Cache-Control Header für HTTP-Caching
    const headers = new Headers();
    headers.set("Cache-Control", `private, max-age=${CACHE_TTL}`);

    return NextResponse.json(data, {
      headers,
      status: 200,
    });
  } catch (e) {
    console.error("Substitution data error:", e);

    // Spezifische Fehlerbehandlung für Timeout
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 504 } // Gateway Timeout
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
