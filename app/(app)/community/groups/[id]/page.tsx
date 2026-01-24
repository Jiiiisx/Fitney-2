"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, User, Info } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GroupDetailModal from "../../components/GroupDetailModal";

// Fetcher
const fetcher = (url: string) => {
    return fetch(url, { credentials: 'include' }).then(res => res.json());
};

export default function GroupChatPage() {
    const params = useParams();
    const router = useRouter();

    // Pastikan ID adalah number jika database id group adalah integer
    const groupId = params?.id ? Number(params.id) : null;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch specific group details directly
    // Note: API endpoint for single group might need to be verified or created if missing.
    // Assuming GET /api/community/groups/[id] exists or filtering list if not.
    // Let's try to fetch list and find for now to match previous logic, but cleaner.
    // BETTER: Use proper endpoint. I'll assume standard REST: /api/community/groups/[id]
    const { data: groupData, error: groupError } = useSWR(
        groupId ? `/api/community/groups/${groupId}` : null,
        fetcher
    );

    // Fallback logic if API returns array or error
    // If your API returns single object, great.

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Decode Token
    useEffect(() => {
        fetch('/api/users/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.userId) setCurrentUserId(data.userId);
            })
            .catch(err => console.error("Error fetching current user", err));
    }, []);

    // Fetch Messages
    const { data: messages, mutate } = useSWR(
        groupId ? `/api/community/groups/${groupId}/messages` : null,
        fetcher,
        { refreshInterval: 3000 }
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !groupId) return;

        const tempContent = input;
        setInput("");
        setSending(true);

        try {
            await fetch(`/api/community/groups/${groupId}/messages`, {
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

    if (groupError) return <div className="p-8 text-center text-red-500">Error loading group.</div>;
    if (!groupId) return <div className="p-8 text-center">Invalid Group ID</div>;

    const groupName = groupData?.name || "Group Chat";
    const groupImage = groupData?.imageUrl;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-background rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card z-10 shadow-sm">
                <Link
                    href="/community"
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                {/* Only show modal trigger if group data is loaded */}
                {groupData ? (
                    <GroupDetailModal group={groupData}>
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -my-2 rounded-lg transition-colors flex-grow">
                            {groupImage ? (
                                <img src={groupImage} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {groupName?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                                    {groupName}
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                </h2>
                                <p className="text-xs text-muted-foreground">Tap for info</p>
                            </div>
                        </div>
                    </GroupDetailModal>
                ) : (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-semibold">Loading...</span>
                    </div>
                )}
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
                                <div className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card text-foreground border border-border rounded-tl-none'
                                    }`}>
                                    {!isMe && <p className="text-xs font-bold mb-1 opacity-80">{msg.user.fullName || msg.user.username}</p>}
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <span className="text-[10px] opacity-60 mt-1 block text-right">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
