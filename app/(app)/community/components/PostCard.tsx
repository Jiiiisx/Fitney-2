import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2, Bookmark, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { likePost, savePost } from "../hooks/useCommunity";
import CommentSection from "./CommentSection";

interface PostData {
  id: number;
  userId: string;
  content: string;
  images: string[];
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
    username: string;
    role?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

// Helper untuk merender text dengan hashtag clickable
const renderContentWithHashtags = (text: string) => {
  if (!text) return null;

  // Regex untuk mencari hashtag (#word)
  // Penjelasan: Mencari karakter '#' diikuti huruf/angka/underscore
  const parts = text.split(/(#\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-primary font-semibold hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return part;
  });
};

export default function PostCard({
  post: initialPost,
  currentUserId,
  onDelete,
}: {
  post: PostData;
  currentUserId: string | null;
  onDelete?: (id: number) => void;
}) {
  const [post, setPost] = useState(initialPost);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Carousel Navigation
  const nextImage = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Helper untuk format tanggal aman
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "just now";
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    // Optimistic Update
    const prevPost = { ...post };
    setPost((p) => ({
      ...p,
      isLiked: !p.isLiked,
      likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
    }));
    setIsLiking(true);

    try {
      await likePost(post.id);
      // Success, no action needed as UI is already updated
    } catch (error) {
      // Revert if failed
      setPost(prevPost);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    const prevPost = { ...post };
    // Optimistic
    setPost(p => ({ ...p, isSaved: !p.isSaved }));

    try {
      await savePost(post.id);
      // Toast handled in hook
    } catch (error) {
      setPost(prevPost); // Revert
    }
  };

  const handleDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: "DELETE",
        credentials: 'include', // Send cookies automatically
      });

      if (res.ok) {
        toast.success("Post deleted");
        if (onDelete) onDelete(post.id);
      } else {
        toast.error("Failed to delete post");
      }
    } catch (e) {
      toast.error("Error deleting post");
    }
  };

  return (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-6 relative group transition-all hover:shadow-md">
      {/* Delete Menu (Only for owner) */}
      {isMounted && currentUserId === post.userId && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Post Header */}
      <Link href={`/community/profile/${post.user.username}`} className="flex items-center mb-4 cursor-pointer group/user">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt={post.user.name || post.user.username}
            className="w-10 h-10 rounded-full mr-3 object-cover border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 border border-primary/20">
            <span className="font-bold text-primary">
              {(post.user.name || post.user.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-foreground text-sm group-hover/user:underline">{post.user.name || post.user.username}</p>
            {(post.user.role === 'pro' || post.user.role === 'premium') && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded-md border border-blue-500/20 shadow-sm" title="Pro Member">
                    <Crown className="w-3 h-3 fill-current" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">PRO</span>
                </div>
            )}
            {(post.user.role === 'elite' || post.user.role === 'admin') && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-md border border-yellow-500/20 shadow-sm" title="Elite Member">
                    <Crown className="w-3 h-3 fill-current" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">ELITE</span>
                </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.createdAt)}
          </p>
        </div>
      </Link>

      {/* Post Content */}
      <div className="text-foreground text-base mb-4 whitespace-pre-wrap break-words leading-relaxed">
        {renderContentWithHashtags(post.content)}
      </div>

      {/* Multi-Image Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="mt-3 relative group/carousel -mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full">
          <div className="overflow-hidden sm:rounded-lg border-y sm:border border-border bg-muted max-h-96 flex items-center justify-center">
            <img
              src={post.images[currentImageIndex]}
              alt={`Post content ${currentImageIndex + 1}`}
              className="w-full h-full object-contain max-h-96"
            />
          </div>

          {/* Navigation Buttons */}
          {post.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={(e) => { e.preventDefault(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {post.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between text-muted-foreground mt-4 pt-4 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors duration-300 group ${post.isLiked ? "text-red-500" : "hover:text-red-500"
            }`}
        >
          <Heart
            className={`w-5 h-5 group-hover:scale-110 transition-transform ${post.isLiked ? "fill-current" : ""
              }`}
          />
          <span className="font-medium text-sm">{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 group ${showComments ? "text-blue-500" : ""
            }`}
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">{post.commentsCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors duration-300 group">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 transition-colors duration-300 group ${post.isSaved ? "text-primary" : "hover:text-primary"
            }`}
        >
          <Bookmark className={`w-5 h-5 group-hover:scale-110 transition-transform ${post.isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          postOwnerId={post.userId}
          onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))}
        />
      )}
    </div>
  );
}
