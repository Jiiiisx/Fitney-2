import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";

// Fetcher function standar
const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
};

// --- HOOKS ---

export function useCommunityFeed() {
  const { data, error, isLoading, mutate } = useSWR("/api/community/feed", fetcher, {
    refreshInterval: 60000, // Auto refresh setiap 1 menit
    revalidateOnFocus: false,
  });

  return {
    posts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSuggestions() {
  const { data, error, isLoading, mutate } = useSWR("/api/community/friends/suggestions", fetcher);

  return {
    suggestions: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// --- ACTIONS ---

export async function likePost(postId: number) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/community/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error("Failed to like post");
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Gagal menyukai postingan");
    throw error;
  }
}

export async function createComment(postId: number, content: string) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) throw new Error("Failed to post comment");

    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Gagal mengirim komentar");
    throw error;
  }
}

export async function fetchComments(postId: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/community/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  return await res.json();
}

export async function createPost(content: string, imageUrl?: string) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/community/posts`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content, imageUrl }),
    });

    if (!res.ok) throw new Error("Failed to create post");

    toast.success("Postingan berhasil dibuat!");
    // Trigger re-fetch feed
    mutate("/api/community/feed"); 
    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Gagal membuat postingan");
    throw error;
  }
}

export async function followUser(userId: string) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/community/users/${userId}/follow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to follow user");

    const data = await res.json();
    
    // Feedback text
    if (data.following) {
        toast.success("Berhasil mengikuti pengguna");
    } else {
        toast.success("Berhasil berhenti mengikuti");
    }

    // Trigger re-fetch suggestions (karena user ini harus hilang dari suggestion)
    mutate("/api/community/friends/suggestions");
    
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Gagal memproses permintaan follow");
    throw error;
  }
}
