"use client";

import { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, Image as ImageIcon, Send, Loader2, User, MoreHorizontal, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface for Post
interface PostData {
    id: number;
    userId: string; // Added userId
    content: string;
    imageUrl?: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string;
        username: string;
    };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
}

interface CommentData {
    id: number;
    content: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string;
        username: string;
    }
}

// Single Comment Component with Read More logic
const CommentItem = ({ comment }: { comment: CommentData }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 150; // Character limit before truncation
    const isLong = comment.content.length > maxLength;

    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {comment.user.avatar ? 
                <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover" /> :
                <User className="w-4 h-4 text-muted-foreground" />
                }
            </div>
            <div className="bg-muted/30 p-3 rounded-lg flex-grow min-w-0">
                <p className="text-xs font-bold text-foreground mb-1">{comment.user.name}</p>
                <div className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                    {isLong && !isExpanded 
                        ? `${comment.content.substring(0, maxLength)}...` 
                        : comment.content
                    }
                </div>
                {isLong && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-primary mt-1 hover:underline focus:outline-none"
                    >
                        {isExpanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>
        </div>
    );
};

// Single Post Component
const Post = ({ post: initialPost, currentUserId, onDelete }: { post: PostData, currentUserId: string | null, onDelete: (id: number) => void }) => {
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLike] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleDeleteClick = async () => {
      if (confirm("Are you sure you want to delete this post?")) {
          setIsDeleting(true);
          try {
              const token = localStorage.getItem("token");
              const res = await fetch(`/api/community/posts/${post.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                  toast.success("Post deleted");
                  onDelete(post.id);
              } else {
                  toast.error("Failed to delete");
              }
          } catch (e) {
              toast.error("Error deleting post");
          } finally {
              setIsDeleting(false);
          }
      }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    // Optimistic Update
    const prevPost = { ...post };
    setPost(p => ({
        ...p,
        isLiked: !p.isLiked,
        likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
    }));
    setIsLike(true);

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/community/posts/${post.id}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to like");
    } catch (error) {
        // Revert
        setPost(prevPost);
        toast.error("Failed to update like");
    } finally {
        setIsLike(false);
    }
  };

  const toggleComments = async () => {
      if (!showComments && comments.length === 0) {
          setLoadingComments(true);
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/community/posts/${post.id}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
          } catch (e) {
              console.error(e);
          } finally {
              setLoadingComments(false);
          }
      }
      setShowComments(!showComments);
  };

  const handleCommentSubmit = async () => {
      if (!commentInput.trim()) return;
      setIsSubmittingComment(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/community/posts/${post.id}/comments`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ content: commentInput })
        });

        if (res.ok) {
            setCommentInput("");
            toast.success("Comment added!");
            // Refresh comments
            const refreshRes = await fetch(`/api/community/posts/${post.id}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newData = await refreshRes.json();
            setComments(newData);
            setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }));
        }
      } catch (e) {
          toast.error("Failed to post comment");
      } finally {
          setIsSubmittingComment(false);
      }
  };

  if (isDeleting) return null; // Hide while deleting

  return (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-6 relative group">
      {/* Delete Menu (Only for owner) */}
      {currentUserId === post.userId && (
          <div className="absolute top-4 right-4">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Post
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
      )}

      {/* Post Header */}
      <div className="flex items-center mb-4">
        {post.user.avatar ? (
          <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <span className="font-bold text-primary">{post.user.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <p className="font-bold text-foreground text-sm">{post.user.name}</p>
          <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
  
      {/* Post Content */}
      <p className="text-foreground text-base mb-4 whitespace-pre-wrap break-words leading-relaxed">{post.content}</p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post image"
          className="mt-3 rounded-lg w-full object-cover max-h-96"
        />
      )}
  
      {/* Post Actions */}
      <div className="flex items-center justify-between text-muted-foreground mt-4 pt-4 border-t border-border">
        <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors duration-300 group ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium text-sm">{post.likesCount}</span>
        </button>
        <button 
            onClick={toggleComments}
            className={`flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 group ${showComments ? 'text-blue-500' : ''}`}
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">{post.commentsCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors duration-300 group">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
              {/* Comment List */}
              <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                  {loadingComments ? (
                      <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                  ) : comments.length > 0 ? (
                      comments.map(comment => (
                          <CommentItem key={comment.id} comment={comment} />
                      ))
                  ) : (
                      <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
                  )}
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 items-end">
                  <div className="flex-grow">
                    <textarea 
                        className="w-full p-2 bg-muted/20 border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                        placeholder="Write a comment..."
                        rows={1}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmittingComment || !commentInput.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                      {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

// A new Post Composer component
const PostComposer = ({ onPostCreated }: { onPostCreated: () => void }) => {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!content.trim()) return;
        setIsPosting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to post");
                return;
            }

            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                setContent("");
                toast.success("Posted successfully!");
                onPostCreated();
            } else {
                toast.error("Failed to post");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error posting");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-8">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                    <User className="text-muted-foreground w-6 h-6" />
                </div>
                <textarea
                className="w-full p-3 bg-muted/30 border-none focus:ring-0 rounded-lg text-base text-foreground placeholder:text-muted-foreground resize-none"
                placeholder="Share your progress or motivation..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                ></textarea>
            </div>
            <div className="flex justify-between items-center mt-3 pl-14">
                <div className="flex space-x-2">
                    <button className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                </div>
                <button 
                    onClick={handlePost} 
                    disabled={isPosting || !content.trim()}
                    className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPosting ? 'Posting...' : 'Post'}
                    {!isPosting && <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};


const MainFeed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
        const token = localStorage.getItem("token");
        // Get user ID from token
        if (token) {
            try {
                // Decode payload (Part 2 of JWT)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.sub) {
                    setCurrentUserId(payload.sub);
                }
            } catch (e) {
                console.error("Error decoding token", e);
            }
        }

        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/community/feed", { headers });
        if (res.ok) {
            const data = await res.json();
            setPosts(data);
        }
    } catch (error) {
        console.error("Failed to fetch feed", error);
    } finally {
        setLoading(false);
    }
  };

  const handleDeletePost = (deletedPostId: number) => {
      setPosts(posts.filter(p => p.id !== deletedPostId));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <PostComposer onPostCreated={fetchPosts} />
      
      {loading ? (
          <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
                <Post 
                    key={post.id} 
                    post={post} 
                    currentUserId={currentUserId}
                    onDelete={handleDeletePost}
                />
            ))}
          </div>
      ) : (
          <div className="text-center py-10 text-muted-foreground">
              No posts yet. Be the first to share!
          </div>
      )}
    </div>
  );
};

export default MainFeed;