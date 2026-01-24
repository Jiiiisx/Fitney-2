import useSWR from "swr";

const fetcher = (url: string) => {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
};

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR("/api/users/profile", fetcher, {
    revalidateOnFocus: false, // Jangan fetch ulang tiap klik window biar hemat
  });

  return {
    user: data,
    isLoading,
    isError: error,
  };
}
