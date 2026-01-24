"use client";

import { useState, useRef, useEffect } from "react";
import { User, Image as ImageIcon, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPost, uploadImage } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";
import toast from "react-hot-toast";

interface Hashtag {
  tag: string;
  count: number;
}

export default function CreatePost() {
  const { user } = useCurrentUser(); // Ambil data user
  const [isExpanded, setIsExpanded] = useState(false); // New state for collapsing
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Hashtag Autocomplete States
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Hashtag[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeTagIndex, setActiveTagIndex] = useState(0); // For keyboard navigation

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for click outside

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only collapse if not currently posting
        if (!isPosting) {
          setIsExpanded(false);
          // Optional: clear content if it was empty anyway
          if (!content.trim() && selectedFiles.length === 0) {
            setContent("");
            removeImage(-1); // Clear all
          }
        }
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, isPosting, content, selectedFiles]);

  // Focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Load trending hashtags on mount
  useEffect(() => {
    fetch("/api/community/hashtags/trending")
      .then(res => res.json())
      .then(data => setHashtags(data))
      .catch(err => console.error("Failed to load hashtags", err));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        const newUrls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newUrls]);
        setIsExpanded(true);
      }
    }
  };

  const removeImage = (index: number) => {
    if (index === -1) {
      // Clear all
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsPosting(true);
    try {
      const imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        // Upload sequentially or parallel
        const uploadPromises = selectedFiles.map(file => uploadImage(file));
        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      await createPost(content, imageUrls);
      setContent("");
      removeImage(-1); // Clear all
      setShowSuggestions(false);
      setIsExpanded(false); // Collapse after posting
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsPosting(false);
    }
  };

  // --- HASHTAG LOGIC ---
  // ... (keeping existing hashtag logic)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setContent(val);
    setCursorPosition(cursor);

    // Detect hashtag
    const textBeforeCursor = val.slice(0, cursor);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith("#") && currentWord.length > 1) {
      const query = currentWord.slice(1).toLowerCase();
      const matches = hashtags.filter(h => h.tag.toLowerCase().startsWith(query));

      if (matches.length > 0) {
        setFilteredTags(matches);
        setShowSuggestions(true);
        setActiveTagIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectHashtag = (tag: string) => {
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);

    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    // Remove current partial tag
    const newTextBefore = textBeforeCursor.slice(0, -currentWord.length);

    const newContent = newTextBefore + `#${tag} ` + textAfterCursor;

    setContent(newContent);
    setShowSuggestions(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveTagIndex(prev => (prev + 1) % filteredTags.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveTagIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredTags[activeTagIndex]) {
          selectHashtag(filteredTags[activeTagIndex].tag);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-card p-4 rounded-xl border border-border shadow-sm mb-8 transition-all duration-300 ${isExpanded ? "ring-1 ring-primary/20" : ""}`}
    >
      {!isExpanded ? (
        // COMPACT VIEW
        <div className="flex items-center gap-3 cursor-text" onClick={() => setIsExpanded(true)}>
          <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="text-muted-foreground w-6 h-6" />
            )}
          </div>
          <div className="flex-grow bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 rounded-full py-2.5 px-5 text-muted-foreground text-sm">
            Share your progress...
          </div>
          <button
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // EXPANDED VIEW
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="text-muted-foreground w-6 h-6" />
              )}
            </div>
            <div className="flex-grow relative">
              <textarea
                ref={textareaRef}
                className="w-full p-2 bg-transparent border-none focus:ring-0 rounded-lg text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[100px]"
                placeholder="What's on your mind? Type # for tags"
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
              ></textarea>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredTags.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {filteredTags.map((item, index) => (
                      <button
                        key={item.tag}
                        onClick={() => selectHashtag(item.tag)}
                        className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors ${index === activeTagIndex
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                          }`}
                      >
                        <span className="font-medium">#{item.tag}</span>
                        <span className="text-xs text-muted-foreground">{item.count} posts</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mt-3 snap-x">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative flex-shrink-0 snap-center">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="rounded-lg h-32 w-32 object-cover border border-border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors flex items-center gap-2 group"
              >
                <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Add Photo</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  if (!content.trim() && selectedFiles.length === 0) {
                    setContent("");
                    removeImage(-1);
                  }
                }}
                disabled={isPosting}
              >
                Cancel
              </Button>
              <button
                onClick={handlePost}
                disabled={isPosting || (!content.trim() && selectedFiles.length === 0)}
                className="bg-primary text-primary-foreground font-bold py-1.5 px-6 rounded-full hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isPosting ? "Posting..." : "Post"}
                {!isPosting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}