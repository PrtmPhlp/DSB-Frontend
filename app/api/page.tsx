"use client";
// pages/fetchData.tsx
import { useEffect, useState } from 'react';

// Definieren Sie einen Typ für die Daten
type ApiData = {
  class: string;
  createdAt: string;
  substitution: Array<{
    content: Array<{
      info: string;
      position: string;
      room: string;
      subject: string;
      teacher: string;
      topic: string;
    }>;
    date: string;
    id: string;
    weekDay: [string, string];
  }>;
};

// Hook zum Abrufen der Daten
export const useFetchData = () => {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.0.1.6:5555/api/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, error, loading };
};

// Komponente zum Anzeigen der Daten
const DataDisplay = ({ data }: { data: ApiData }) => (
  <div>
    <h1>Fetched Data:</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

// Hauptkomponente
const FetchData = () => {
  const { data, error, loading } = useFetchData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return <DataDisplay data={data} />;
};

export default FetchData;
