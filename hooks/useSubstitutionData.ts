import { useCallback, useEffect, useState } from "react";

interface SubstitutionContent {
  info: string;
  position: string;
  room: string;
  subject: string;
  teacher: string;
  topic: string;
}

interface SubstitutionItem {
  content: SubstitutionContent[];
  date: string;
  id: string;
  weekDay: [string, string];
}

interface CourseData {
  substitution: SubstitutionItem[];
}

interface MultiCourseData {
  createdAt: string;
  courses: Record<string, CourseData>;
}

interface LoginResponse {
  access_token: string;
}

// Interface für detaillierte API-Fehler
interface ApiError {
  status: number;
  message: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.home.pertermann.de";

export const useSubstitutionData = () => {
  const [data, setData] = useState<MultiCourseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<boolean>(false);

  const loginWithCredentials = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        // Nutzen des API-Endpunkts für die Authentifizierung
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();

          // Spezifische Fehlerbehandlung basierend auf HTTP-Status
          const apiError: ApiError = {
            status: response.status,
            message: errorResponse.error || "Login fehlgeschlagen",
          };

          setApiErrors((prev) => [...prev, apiError]);

          // Benutzerfreundliche Fehlermeldungen basierend auf Status
          switch (response.status) {
            case 401:
              throw new Error(
                "Ungültige Anmeldedaten. Bitte überprüfe deinen Benutzernamen und dein Passwort."
              );
            case 429:
              throw new Error(
                "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut."
              );
            default:
              throw new Error(errorResponse.error || "Login fehlgeschlagen");
          }
        }

        // In diesem Fall verwenden wir einen Dummy-Token, da der echte Token
        // in einem HTTP-only Cookie gespeichert ist
        setToken("authenticated");
        setApiErrors([]);
        setError(null);
        return true;
      } catch (error) {
        setError((error as Error).message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    // Aufruf des API-Endpunkts zum Löschen des Auth-Cookies
    fetch("/api/auth", { method: "DELETE" }).then(() => {
      setToken(null);
    });
  }, []);

  // Neue Funktion zum Überprüfen des Auth-Status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setToken("authenticated");
          setError(null);
        } else {
          setToken(null);
        }
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error("Auth status check failed:", error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auth-Status beim App-Start überprüfen
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Maximale Anzahl von automatischen Wiederholungsversuchen bei Fehlern
  const MAX_RETRIES = 2;

  useEffect(() => {
    if (!token) return;

    let retryCount = 0;

    const fetchData = async () => {
      try {
        // Verwende den API-Endpunkt, der den Cookie weiterleitet
        const response = await fetch("/api/substitutions");

        if (!response.ok) {
          // Spezifische Fehlerbehandlung basierend auf HTTP-Status
          const apiError: ApiError = {
            status: response.status,
            message: `Fehler beim Abrufen der Daten: ${response.statusText}`,
          };

          setApiErrors((prev) => [...prev, apiError]);

          if (response.status === 401 || response.status === 403) {
            // Authentifizierungsfehler - Token abgelaufen oder ungültig
            setToken(null);
            throw new Error(
              "Deine Anmeldung ist abgelaufen. Bitte melde dich erneut an."
            );
          } else if (response.status >= 500) {
            // Serverfehler - Retry möglich
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              // Exponentielles Backoff für Retries (1s, dann 2s, dann 4s...)
              const retryDelay = Math.pow(2, retryCount - 1) * 1000;
              console.log(`Versuche erneut in ${retryDelay}ms...`);

              setTimeout(fetchData, retryDelay);
              return;
            }
          }

          throw new Error(`Fehler ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setApiErrors([]);
        setError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        if (errorMessage.includes("Anmeldung ist abgelaufen")) {
          setToken(null);
        }
      } finally {
        setTimeout(() => {
          setShowSkeleton(false);
          setIsLoading(false);
        }, 300);
      }
    };

    fetchData();
  }, [token, MAX_RETRIES]);

  return {
    data,
    error,
    apiErrors, // Neue detaillierte API-Fehler
    showSkeleton,
    token,
    isLoading,
    apiError,
    loginWithCredentials,
    logout,
    checkAuthStatus, // Expose this to manually check auth status when needed
  };
};
