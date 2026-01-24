import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import toast from "react-hot-toast";

// Fetcher function standar (cookie-based)
export const fetcher = (url: string) => {
  return fetch(url, {
    credentials: 'include', // Send cookies automatically
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
};

// --- HOOKS ---

export type FeedFilter = "all" | "mine" | "friends";

export function useCommunityFeed(filter: FeedFilter = "all", hashtag?: string | null) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    let url = `/api/community/feed?filter=${filter}`;
    if (hashtag) url += `&hashtag=${hashtag}`;
    
    if (pageIndex === 0) return url;
    if (!previousPageData || !previousPageData.nextCursor) return null;
    return `${url}&cursor=${previousPageData.nextCursor}`;
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite(getKey, fetcher, {
    refreshInterval: 0, // Disable polling for infinite scroll for now or keep it? Better manual refresh or strict optimistic
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  });

  const posts = data ? data.flatMap((page: any) => page.posts) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

  return {
    posts,
    isLoading: isLoading && !data, // Initial load
    isError: error,
    mutate,
    loadMore: () => setSize(size + 1),
    isLoadingMore,
    isReachingEnd,
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

export function useStories() {
  const { data, error, isLoading, mutate } = useSWR("/api/community/stories", fetcher);

  return {
    stories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFriends() {
  const { data, error, isLoading, mutate } = useSWR("/api/community/friends", fetcher);

  return {
    friends: data || [],
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

// Group Members Hook
export function useGroupMembers(groupId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    groupId ? `/api/community/groups/${groupId}/members` : null,
    fetcher
  );

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Direct Messages Hook
export function useDirectMessages(friendId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    friendId ? `/api/community/messages/direct/${friendId}` : null,
    fetcher,
    { refreshInterval: 3000 } // Poll every 3 seconds for real-time feel
  );

  return {
    messages: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// --- ACTIONS ---

export async function kickMember(groupId: number, userId: string) {
  try {
    const res = await fetch(`/api/community/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to kick member");
    }

    toast.success("Member removed from group");
    return true;
  } catch (error: any) {
    console.error(error);
    toast.error(error.message || "Failed to kick member");
    throw error;
  }
}

export async function addMember(groupId: number, userId: string) {
  try {
    const res = await fetch(`/api/community/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add member");
    }

    toast.success("Member added!");
    return true;
  } catch (error: any) {
    console.error(error);
    toast.error(error.message || "Failed to add member");
    throw error;
  }
}

export async function createGroup(name: string, description: string, imageUrl?: string) {
  try {
    const res = await fetch(`/api/community/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

export async function deleteGroup(groupId: number) {
  try {
    const res = await fetch(`/api/community/groups/${groupId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete group");

    toast.success("Group deleted successfully");
    // Refresh lists
    await Promise.all([
      mutate("/api/community/groups?filter=all"),
      mutate("/api/community/groups?filter=created")
    ]);

    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete group");
    throw error;
  }
}

export async function likePost(postId: number) {
  try {
    const res = await fetch(`/api/community/posts/${postId}/like`, {
      method: "POST",
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

export async function createComment(postId: number, content: string, parentId?: number) {
  try {
    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, parentId }),
    });

    if (!res.ok) throw new Error("Failed to post comment");

    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Gagal mengirim komentar");
    throw error;
  }
}

export async function deleteComment(postId: number, commentId: number) {
  try {
    const res = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete comment");

    toast.success("Comment deleted");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete comment");
    throw error;
  }
}

export async function savePost(postId: number) {
  try {
    const res = await fetch(`/api/community/posts/${postId}/save`, {
      method: "POST",
    });

    if (!res.ok) throw new Error("Failed to save post");

    const data = await res.json();
    toast.success(data.message || "Post saved successfully!");
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to save post");
    throw error;
  }
}

export async function fetchComments(postId: number) {
  const res = await fetch(`/api/community/posts/${postId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return await res.json();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
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

export async function createStory(mediaUrl: string) {
  try {
    const res = await fetch(`/api/community/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mediaUrl }),
    });

    if (!res.ok) throw new Error("Failed to create story");

    toast.success("Story uploaded!");
    mutate("/api/community/stories");
    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload story");
    throw error;
  }
}

export async function createPost(content: string, images: string[] = []) {
  try {
    const res = await fetch(`/api/community/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, images }),
    });

    if (!res.ok) throw new Error("Failed to create post");

    toast.success("Postingan berhasil dibuat!");
    // Trigger re-fetch feed default (all) dan mine (jika user sedang di tab mine)
    // SWR mutate global key matching:
    // Idealnya kita revalidate semua key yang start with /api/community/feed
    // Tapi simpelnya kita hit spesifik
    // Invalidate all feed keys roughly
    mutate((key) => typeof key === 'string' && key.startsWith('/api/community/feed'), undefined, { revalidate: true });

    return await res.json();
  } catch (error) {
    console.error(error);
    toast.error("Gagal membuat postingan");
    throw error;
  }
}

export async function followUser(userId: string) {
  try {
    const res = await fetch(`/api/community/users/${userId}/follow`, {
      method: "POST",
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