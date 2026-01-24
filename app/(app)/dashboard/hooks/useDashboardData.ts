import useSWR from 'swr';
import { DashboardData } from '@/app/lib/types/api';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include', // Send cookies automatically
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/stats/dashboard',
    fetcher,
    {
      revalidateOnFocus: false, // Opsional: matikan jika tidak ingin auto-refresh saat ganti tab
      refreshInterval: 0, // Opsional: set waktu (ms) untuk polling otomatis
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate, // Fungsi untuk memaksa refresh data (berguna setelah user update workout)
  };
}
