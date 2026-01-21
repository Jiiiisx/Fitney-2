"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Send } from "lucide-react";
import { fetchComments, createComment } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface CommentData {
  id: number;
  content: string;
  createdAt: string;
  user: {
    fullName: string | null;
    imageUrl: string | null;
    username: string;
  };
}

const CommentItem = ({ comment }: { comment: CommentData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const isLong = comment.content.length > maxLength;
  const displayName = comment.user.fullName || comment.user.username;

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
        {comment.user.imageUrl ? (
          <img
            src={comment.user.imageUrl}
            className="w-full h-full object-cover"
            alt={displayName}
          />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <div className="bg-muted/30 p-3 rounded-lg flex-grow min-w-0">
        <p className="text-xs font-bold text-foreground mb-1">
          {displayName}
        </p>
        <div className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
          {isLong && !isExpanded
            ? `${comment.content.substring(0, maxLength)}...`
            : comment.content}
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

export default function CommentSection({
  postId,
  onCommentAdded,
}: {
  postId: number;
  onCommentAdded: () => void;
}) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCurrentUser();

  useEffect(() => {
    let isMounted = true;
    fetchComments(postId)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await createComment(postId, input);
      setComments((prev) => [...prev, newComment]);
      setInput("");
      onCommentAdded();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
      {/* Comment List */}
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center p-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No comments yet.
          </p>
        )}
      </div>

      {/* Comment Input */}
      <div className="flex gap-3 items-start mt-4 pt-2 border-t border-border/40">
        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border mt-1">
             {user?.imageUrl ? (
               <img src={user.imageUrl} alt="Me" className="w-full h-full object-cover" />
             ) : (
               <User className="text-muted-foreground w-4 h-4" />
             )}
        </div>
        <div className="flex-grow flex gap-2 items-end">
          <textarea
            className="w-full p-2 bg-muted/20 border border-input rounded-md text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="Write a comment..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !input.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex-shrink-0 mb-[2px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
