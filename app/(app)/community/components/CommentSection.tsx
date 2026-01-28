"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Send, Trash2 } from "lucide-react";
import useSWR from "swr";
import { fetcher, createComment, deleteComment } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface CommentData {
  id: number;
  content: string;
  createdAt: string;
  parentId: number | null;
  user: {
    fullName: string | null;
    imageUrl: string | null;
    username: string;
  };
  userId: string; // Add root level userId for easier check
  replies?: CommentData[]; // For UI tree
}

const CommentItem = ({
  comment,
  onReply,
  currentUserId,
  postOwnerId,
  onDelete
}: {
  comment: CommentData;
  onReply: (comment: CommentData) => void;
  currentUserId: string | null;
  postOwnerId: string;
  onDelete: (commentId: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const isLong = comment.content.length > maxLength;
  const displayName = comment.user.fullName || comment.user.username;

  // Permission Check
  // 1. Comment Author
  // 2. Post Owner
  const canDelete = (currentUserId && comment.user.username) // Note: username is not ideal for ID check but we need user ID in comment payload. 
  // Let's modify fetcher to return user ID properly in comment user object if needed, 
  // currently DB schema usually joins users. 
  // Let's assume comment.user object might NOT have ID in previous interface.
  // Checking interface...
  // Interface `user` in `CommentData` needs `id`.

  // WAIT. I need to update the interface `CommentData` first to include `id`.
  const isAuthor = currentUserId === (comment as any).userId; // We'll fix interface below
  const isPostOwner = currentUserId === postOwnerId;

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
      <div className="flex-grow min-w-0">
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-foreground mb-1">
              {displayName}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

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

        {/* Actions */}
        <div className="flex gap-4 mt-1 ml-1 items-center">
          <button
            onClick={() => onReply(comment)}
            className="text-xs text-muted-foreground hover:text-primary font-medium"
          >
            Reply
          </button>

          {(isAuthor || isPostOwner) && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete Comment"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-3 border-l-2 border-border/50">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUserId={currentUserId}
                postOwnerId={postOwnerId}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CommentSection({
  postId,
  postOwnerId,
  onCommentAdded,
}: {
  postId: number;
  postOwnerId: string;
  onCommentAdded: () => void;
}) {

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const { user } = useCurrentUser();

  // Helper to build tree
  const buildCommentTree = (flatComments: CommentData[]) => {
    const commentMap: { [key: number]: CommentData } = {};
    const roots: CommentData[] = [];

    // Pass 1: Init map and children array
    flatComments.forEach(c => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    // Pass 2: Link parents
    flatComments.forEach(c => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies?.push(commentMap[c.id]);
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    return roots;
  };

  // Polling Realtime Komentar using SWR
  const { data: comments, mutate: refreshComments } = useSWR<CommentData[]>(
    `/api/community/posts/${postId}/comments`,
    fetcher,
    { refreshInterval: 3000 } // Poll every 3 seconds for near real-time feel
  );

  const isLoading = !comments;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const content = input;
    const parentId = replyingTo ? replyingTo.id : null; // Ensure null if undefined

    // 1. Prepare Optimistic Data
    const optimisticComment: CommentData = {
      id: Date.now(), // Temporary ID
      content: content,
      createdAt: new Date().toISOString(),
      parentId: parentId,
      userId: user?.id || 'temp-user',
      user: {
        fullName: user?.fullName || 'Me',
        imageUrl: user?.imageUrl || null,
        username: user?.username || 'me',
      },
      replies: []
    };

    setIsSubmitting(true);
    setInput(""); // Clear input immediately for UX
    setReplyingTo(null);

    try {
      // 2. Optimistic Update SWR Cache
      await refreshComments(
        (currentData) => {
          if (!currentData) return [optimisticComment];
          return [...currentData, optimisticComment];
        },
        { revalidate: false } // Jangan fetch dulu
      );
      
      onCommentAdded(); // Update counter UI immediately

      // 3. Perform Actual API Call
      await createComment(postId, content, parentId || undefined);

      // 4. Revalidate to get real ID and data from server
      refreshComments();
    } catch (error) {
      console.error("Failed to post comment", error);
      // Revert/Revalidate if failed
      refreshComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(postId, commentId);
      refreshComments();
    } catch (e) {
      // Toast handled
    }
  };

  const commentTree = buildCommentTree(comments || []);

  return (
    <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
      {/* Comment List */}
      <div className="space-y-6 mb-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center p-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : commentTree.length > 0 ? (
          commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(c) => {
                setReplyingTo(c);
              }}
              currentUserId={user?.id || null}
              postOwnerId={postOwnerId}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No comments yet.
          </p>
        )}
      </div>

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-t-md border-x border-t border-border/50 text-xs">
          <span className="text-muted-foreground">Replying to <b>{replyingTo.user.fullName || replyingTo.user.username}</b></span>
          <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      )}

      {/* Comment Input */}
      <div className={`flex gap-3 items-start ${replyingTo ? 'bg-muted/30 p-2 rounded-b-md border-x border-b border-border/50' : 'mt-4 pt-2 border-t border-border/40'}`}>
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
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
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
