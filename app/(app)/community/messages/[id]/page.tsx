"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, User, Info, Phone, Video, Trash2, MoreVertical } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDirectMessages } from "../../hooks/useCommunity";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Fetcher
const fetcher = (url: string) => {
    return fetch(url, { credentials: 'include' }).then(res => res.json());
};

export default function DirectChatPage() {
    const params = useParams();
    const router = useRouter();
    const friendId = params?.id as string;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastTypingSent = useRef<number>(0);

    // Fetch friend profile
    const { data: friend, error: friendError } = useSWR(
        friendId ? `/api/community/users/${friendId}` : null,
        fetcher
    );

    // Fetch Typing Status
    const { data: typers } = useSWR(
        friendId ? `/api/community/messages/typing?targetId=${currentUserId}&type=direct` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Fetch Messages using our hook
    const { messages, mutate, isLoading } = useDirectMessages(friendId);

    // Send typing signal
    useEffect(() => {
        if (input.trim() && Date.now() - lastTypingSent.current > 3000) {
            lastTypingSent.current = Date.now();
            fetch('/api/community/messages/typing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId: friendId, type: 'direct', name: 'Someone' })
            }).catch(() => {});
        }
    }, [input, friendId]);

    // Get current user ID
    useEffect(() => {
        fetch('/api/users/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.userId) setCurrentUserId(data.userId);
            })
            .catch(err => console.error("Error fetching current user", err));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !friendId) return;

        const tempContent = input;
        setInput("");
        setSending(true);

        try {
            await fetch(`/api/community/messages/direct/${friendId}`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: tempContent })
            });
            mutate();
        } catch (err) {
            console.error(err);
            setInput(tempContent);
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm("Delete this message?")) return;
        try {
            await fetch(`/api/community/messages/direct/delete/${messageId}`, {
                method: "DELETE",
                credentials: 'include'
            });
            mutate();
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    if (friendError) return <div className="p-8 text-center text-red-500">Error loading chat.</div>;
    if (!friendId) return <div className="p-8 text-center">Invalid User ID</div>;

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card z-10 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Link
                        href="/community"
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    {friend ? (
                        <Link href={`/community/profile/${friend.id}`} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -my-2 rounded-lg transition-colors">
                            {friend.imageUrl ? (
                                <img src={friend.imageUrl} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {(friend.fullName || friend.username).charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="font-bold text-base leading-tight">
                                    {friend.fullName || friend.username}
                                </h2>
                                {typers && typers.length > 0 ? (
                                    <p className="text-[10px] text-primary animate-pulse font-bold italic">typing...</p>
                                ) : (
                                    <p className="text-[10px] text-green-500 font-medium">Online</p>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-semibold">Loading...</span>
                        </div>
                    )}
                </div>

                {/* Top Right Actions */}
                <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/5">
                {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                             <User className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-medium">No messages yet.</p>
                        <p className="text-xs">Start a conversation with {friend?.fullName || 'your friend'}.</p>
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = msg.senderId === currentUserId;
                        const isDeleted = msg.content === "_DELETED_";

                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm break-words overflow-visible relative group/msg ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card text-foreground border border-border rounded-tl-none'
                                    } ${isDeleted ? 'opacity-60 bg-muted/50 text-muted-foreground italic' : ''}`}>
                                    
                                    <p className="leading-relaxed whitespace-pre-wrap flex items-center gap-2">
                                        {isDeleted ? (
                                            <>
                                                <Info className="w-3.5 h-3.5" />
                                                Pesan ini telah dihapus
                                            </>
                                        ) : msg.content}
                                    </p>

                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] opacity-60 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>

                                        {isMe && !isDeleted && (
                                            <div className="flex-shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-0.5 hover:bg-black/10 rounded transition-colors">
                                                            <MoreVertical className="w-3 h-3" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                            className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-card border-t border-border flex gap-2 items-center flex-shrink-0">
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
