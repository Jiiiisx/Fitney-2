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

export type FeedFilter = "all" | "mine";

export function useCommunityFeed(filter: FeedFilter = "all") {
  // Key SWR bergantung pada filter, jadi cache terpisah
  const url = `/api/community/feed?filter=${filter}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 60000, 
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

export function useMyGroups(filter: "all" | "created" = "all") {
  const { data, error, isLoading, mutate } = useSWR(`/api/community/groups?filter=${filter}`, fetcher);

  return {
    groups: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// --- ACTIONS ---

export async function createGroup(name: string, description: string, imageUrl?: string) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/community/groups`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ name, description, imageUrl }),
    });

    if (!res.ok) throw new Error("Failed to create group");

    toast.success("Group created successfully!");
    // Trigger re-fetch groups explicitly for both filter keys
    await Promise.all([
      mutate("/api/community/groups?filter=all"),
      mutate("/api/community/groups?filter=created")
    ]);
    
    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Failed to create group");
    throw error;
  }
}

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

export async function uploadImage(file: File) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");
    
    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error(error);
    toast.error("Gagal mengupload gambar");
    throw error;
  }
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
    // Trigger re-fetch feed default (all) dan mine (jika user sedang di tab mine)
    // SWR mutate global key matching:
    // Idealnya kita revalidate semua key yang start with /api/community/feed
    // Tapi simpelnya kita hit spesifik
    mutate("/api/community/feed?filter=all"); 
    mutate("/api/community/feed?filter=mine"); 
    
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
    
    if (data.following) {
        toast.success("Berhasil mengikuti pengguna");
    } else {
        toast.success("Berhasil berhenti mengikuti");
    }

    mutate("/api/community/friends/suggestions");
    
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Gagal memproses permintaan follow");
    throw error;
  }
}