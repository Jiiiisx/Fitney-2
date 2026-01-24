"use client";

import { useState, useEffect } from "react";
import { User, Loader2, MessageSquare, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Friend {
    id: string;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
    level: number;
}

export default function FriendsListPage() {
    const router = useRouter();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch(`/api/community/friends`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data);
                }
            } catch (error) {
                console.error("Failed to fetch friends", error);
                toast.error("Could not load friends list");
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    const handleMessage = (userId: string) => {
        // Placeholder for chat or profile
        router.push(`/community/profile/${userId}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Link href="/community">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">My Friends</h2>
                    <p className="text-muted-foreground">Mutual connections ({friends.length})</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : friends.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Friends Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                        Friends are people who follow you back. Start following others to build your circle!
                    </p>
                    <Link href="/community/find-friends">
                        <Button>Find People</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                        <Card key={friend.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-background">
                                    <AvatarImage src={friend.imageUrl || ""} />
                                    <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base truncate">{friend.fullName || friend.username}</h4>
                                    <p className="text-sm text-muted-foreground">@{friend.username} • Lvl {friend.level}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => handleMessage(friend.id)}>
                                    <MessageSquare className="h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
