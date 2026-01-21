"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, User, Info } from "lucide-react";
import { useCommunityNavigation } from "../CommunityContext";
import useSWR from "swr";
import { useCurrentUser } from "../hooks/useCurrentUser";
import GroupDetailModal from "./GroupDetailModal";

// Fetcher
const fetcher = (url: string) => {
    const token = localStorage.getItem("token");
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function GroupChatView() {
  const { selectedGroupId, selectedGroupName, navigateToFeed } = useCommunityNavigation();
  const { user: currentUser } = useCurrentUser();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Fetch detail grup (untuk deskripsi & gambar di header) - Kita reuse endpoint list groups tapi filter di client side
  // Atau lebih baik buat endpoint single group GET /api/community/groups/[id].
  // Untuk efisiensi sekarang, kita akan cari dari cache 'useMyGroups' jika memungkinkan, atau fetch list lagi.
  // Tapi paling bersih adalah fetch list dan cari.
  const { data: groups } = useSWR("/api/community/groups?filter=all", fetcher);
  const currentGroup = groups?.find((g: any) => g.id === selectedGroupId) || { id: selectedGroupId, name: selectedGroupName };

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Decode Token to get User ID
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
          try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
              const payload = JSON.parse(jsonPayload);
              if (payload.sub) setCurrentUserId(payload.sub);
          } catch (e) {
              console.error("Token decode error", e);
          }
      }
  }, []);

  // Fetch Messages (Poll setiap 3 detik untuk real-time sederhana)
  const { data: messages, mutate } = useSWR(
      selectedGroupId ? `/api/community/groups/${selectedGroupId}/messages` : null, 
      fetcher, 
      { refreshInterval: 3000 }
  );

  // Auto scroll ke bawah saat pesan baru masuk
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || !selectedGroupId) return;

      const tempContent = input;
      setInput(""); // Clear input immediately
      setSending(true);

      try {
          const token = localStorage.getItem("token");
          await fetch(`/api/community/groups/${selectedGroupId}/messages`, {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ content: tempContent })
          });
          mutate(); // Refresh pesan
      } catch (err) {
          console.error(err);
          setInput(tempContent); // Revert jika gagal
      } finally {
          setSending(false);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card z-10 shadow-sm">
        <button 
            onClick={navigateToFeed}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
        
        <GroupDetailModal group={currentGroup}>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -my-2 rounded-lg transition-colors flex-grow">
                {currentGroup.imageUrl ? (
                    <img src={currentGroup.imageUrl} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {currentGroup.name?.charAt(0)}
                    </div>
                )}
                <div>
                    <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                        {currentGroup.name}
                        <Info className="w-3 h-3 text-muted-foreground" />
                    </h2>
                    <p className="text-xs text-muted-foreground">Tap for group info</p>
                </div>
            </div>
        </GroupDetailModal>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/10">
        {!messages ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : !Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
                <p>No messages yet.</p>
                <p className="text-sm">Be the first to say hello!</p>
            </div>
        ) : (
            messages.map((msg: any) => {
                const isMe = msg.userId === currentUserId; 
                return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden border border-border mt-1">
                            {msg.user?.imageUrl ? (
                                <img src={msg.user.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm ${
                            isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-card text-foreground border border-border rounded-tl-none'
                        }`}>
                            {!isMe && <p className="text-xs font-bold mb-1 opacity-80">{msg.user.fullName || msg.user.username}</p>}
                            <p className="leading-relaxed">{msg.content}</p>
                            <span className="text-[10px] opacity-60 mt-1 block text-right">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-card border-t border-border flex gap-2 items-center">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-3 bg-muted/30 border border-input rounded-full focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
        />
        <button 
            type="submit" 
            disabled={!input.trim() || sending}
            className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-transform active:scale-95"
        >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
