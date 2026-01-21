"use client";

import { useState, useRef, useEffect } from "react";
import { User, Image as ImageIcon, Send, X } from "lucide-react";
import { createPost, uploadImage } from "../hooks/useCommunity";
import { useCurrentUser } from "../hooks/useCurrentUser";
import toast from "react-hot-toast";

interface Hashtag {
  tag: string;
  count: number;
}

export default function CreatePost() {
  const { user } = useCurrentUser(); // Ambil data user
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  
  // Hashtag Autocomplete States
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Hashtag[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeTagIndex, setActiveTagIndex] = useState(0); // For keyboard navigation

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load trending hashtags on mount
  useEffect(() => {
    fetch("/api/community/hashtags/trending")
      .then(res => res.json())
      .then(data => setHashtags(data))
      .catch(err => console.error("Failed to load hashtags", err));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
          toast.error("Ukuran file maksimal 5MB");
          return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setIsPosting(true);
    try {
      let finalImageUrl = undefined;
      if (selectedFile) {
          finalImageUrl = await uploadImage(selectedFile);
      }
      await createPost(content, finalImageUrl);
      setContent("");
      removeImage();
      setShowSuggestions(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsPosting(false);
    }
  };

  // --- HASHTAG LOGIC ---

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
      
      // Refocus and set cursor
      if (textareaRef.current) {
          textareaRef.current.focus();
          // We can't easily set cursor position perfectly in React without a timeout or layout effect
          // but focusing back is essential
      }
  };

  // Handle keyboard navigation for suggestions
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
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-8 relative z-10">
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
                className="w-full p-3 bg-muted/30 border-none focus:ring-0 rounded-lg text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px]"
                placeholder="Share your progress... Type # for tags"
                rows={3}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            ></textarea>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredTags.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1 max-h-48 overflow-y-auto">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                            Trending Hashtags
                        </div>
                        {filteredTags.map((item, index) => (
                            <button
                                key={item.tag}
                                onClick={() => selectHashtag(item.tag)}
                                className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors ${
                                    index === activeTagIndex 
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

            {/* Image Preview */}
            {previewUrl && (
                <div className="relative mt-3 inline-block">
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="rounded-lg max-h-60 object-cover border border-border"
                    />
                    <button 
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pl-14">
        <div className="flex space-x-2">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
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
        <button
          onClick={handlePost}
          disabled={isPosting || (!content.trim() && !selectedFile)}
          className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPosting ? "Posting..." : "Post"}
          {!isPosting && <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}