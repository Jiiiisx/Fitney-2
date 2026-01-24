"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, User, Info, Trash2, MoreVertical, Copy, CheckSquare, X as CloseIcon } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GroupDetailModal from "../../components/GroupDetailModal";
import toast from "react-hot-toast";
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

export default function GroupChatPage() {
    const params = useParams();
    const router = useRouter();

    // Pastikan ID adalah number jika database id group adalah integer
    const groupId = params?.id ? Number(params.id) : null;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch specific group details directly
    const { data: groupData, error: groupError } = useSWR(
        groupId ? `/api/community/groups/${groupId}` : null,
        fetcher
    );

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

    const handleDeleteMessage = async (messageId: number, mode: 'me' | 'everyone' = 'me') => {
        if (!confirm(`Delete this message for ${mode === 'me' ? 'you' : 'everyone'}?`)) return;
        try {
            await fetch(`/api/community/groups/${groupId}/messages/${messageId}?mode=${mode}`, {
                method: "DELETE",
                credentials: 'include'
            });
            mutate();
        } catch (err) {
            console.error("Failed to delete message", err);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Message copied!");
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async (mode: 'me' | 'everyone' = 'me') => {
        if (!confirm(`Delete ${selectedIds.length} messages for ${mode === 'me' ? 'you' : 'everyone'}?`)) return;
        
        const toastId = toast.loading("Deleting messages...");
        try {
            // Optimistic Update: Hide locally first
            mutate(
                messages.filter((m: any) => !selectedIds.includes(m.id)),
                false
            );

            await fetch(`/api/community/groups/${groupId}/messages`, {
                method: "DELETE",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, mode })
            });

            toast.success(`Messages deleted`, { id: toastId });
            mutate(); // Real sync
            setIsSelectionMode(false);
            setSelectedIds([]);
        } catch (err) {
            toast.error("Failed to delete messages", { id: toastId });
            mutate(); // Revert on error
        }
    };

    // Cek apakah semua pesan yang dipilih adalah milik user ini
    const canDeleteAllForEveryone = selectedIds.length > 0 && selectedIds.every(id => {
        const msg = messages?.find((m: any) => m.id === id);
        return msg?.userId === currentUserId;
    });

    if (groupError) return <div className="p-8 text-center text-red-500">Error loading group.</div>;
    if (!groupId) return <div className="p-8 text-center">Invalid Group ID</div>;

    const groupName = groupData?.name || "Group Chat";
    const groupImage = groupData?.imageUrl;

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card z-10 shadow-sm flex-shrink-0">
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
                        const isDeleted = msg.content === "_DELETED_";
                        const isSelected = selectedIds.includes(msg.id);

                        return (
                            <div 
                                key={msg.id} 
                                className={`flex gap-3 items-center ${isMe ? 'flex-row-reverse' : ''} ${isSelectionMode ? 'cursor-pointer' : ''}`}
                                onClick={() => isSelectionMode && toggleSelection(msg.id)}
                            >
                                {isSelectionMode && (
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                )}

                                <div className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm break-all overflow-visible relative group/msg ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card text-foreground border border-border rounded-tl-none'
                                    } ${isDeleted ? 'opacity-60 bg-muted/50 text-muted-foreground italic' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                    
                                    {!isMe && <p className="text-xs font-bold mb-1 opacity-80">{msg.user.fullName || msg.user.username}</p>}
                                    
                                    <p className="leading-relaxed whitespace-pre-wrap flex items-center gap-2">
                                        {isDeleted ? (
                                            <>
                                                <Info className="w-3.5 h-3.5" />
                                                Pesan ini telah dihapus
                                            </>
                                        ) : msg.content}
                                    </p>
                                    
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] opacity-60">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        
                                        {!isSelectionMode && (
                                            <div className="flex-shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-0.5 hover:bg-black/10 rounded transition-colors text-current">
                                                            <MoreVertical className="w-3 h-3" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        {!isDeleted && (
                                                            <>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleCopy(msg.content)}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    Copy Text
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        setIsSelectionMode(true);
                                                                        setSelectedIds([msg.id]);
                                                                    }}
                                                                    className="flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                                    Select
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteMessage(msg.id, "me")}
                                                            className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete for me
                                                        </DropdownMenuItem>

                                                        {isMe && !isDeleted && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDeleteMessage(msg.id, "everyone")}
                                                                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete for everyone
                                                            </DropdownMenuItem>
                                                        )}
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

            {/* Selection Toolbar or Input Area */}
            {isSelectionMode ? (
                <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedIds([]);
                            }}
                            className="p-2 hover:bg-white/10 rounded-full"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                        <span className="font-bold">{selectedIds.length} selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button 
                                    disabled={selectedIds.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg font-bold disabled:opacity-50 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleBulkDelete('me')} className="cursor-pointer">
                                    Delete for me
                                </DropdownMenuItem>
                                {canDeleteAllForEveryone && (
                                    <DropdownMenuItem onClick={() => handleBulkDelete('everyone')} className="text-destructive focus:text-destructive cursor-pointer">
                                        Delete for everyone
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ) : (
                <form 
                    onSubmit={handleSend} 
                    className="p-4 bg-card border-t border-border flex gap-2 items-end flex-shrink-0"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-grow p-3 bg-muted/30 border border-input rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none min-h-[45px] max-h-32 overflow-y-auto py-3"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-transform active:scale-95 mb-0.5"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            )}
        </div>
    );
}