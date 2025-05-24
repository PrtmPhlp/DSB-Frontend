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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.home.pertermann.de";

export const useSubstitutionData = () => {
  const [data, setData] = useState<MultiCourseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<boolean>(false);

  const loginWithCredentials = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.msg || "Login failed");
        }

        const result: LoginResponse = await response.json();
        setToken(result.access_token);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        setError(null);
      } catch (error) {
        setError((error as Error).message);
        localStorage.removeItem("username");
        localStorage.removeItem("password");
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (savedUsername && savedPassword) {
      loginWithCredentials(savedUsername, savedPassword);
    } else {
      setIsLoading(false);
    }
  }, [loginWithCredentials]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError((error as Error).message);
        setToken(null);
      } finally {
        setTimeout(() => {
          setShowSkeleton(false);
          setIsLoading(false);
        }, 300);
      }
    };

    fetchData();
  }, [token]);

  return {
    data,
    error,
    showSkeleton,
    token,
    isLoading,
    apiError,
    loginWithCredentials,
    logout,
  };
};
