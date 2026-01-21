"use client";

import { useState } from "react";
import { User, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { createPost } from "../hooks/useCommunity";
import toast from "react-hot-toast";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      await createPost(content);
      setContent("");
      // Toast success handled inside createPost
    } catch (error) {
      // Toast error handled inside createPost
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
          className="w-full p-3 bg-muted/30 border-none focus:ring-0 rounded-lg text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
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
          {isPosting ? "Posting..." : "Post"}
          {!isPosting && <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
