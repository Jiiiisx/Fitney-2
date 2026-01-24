"use client";

import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { followUser } from "../hooks/useCommunity";

interface FollowButtonProps {
    userId: string;
    isFollowedInitially?: boolean;
}

export default function FollowButton({ userId, isFollowedInitially = false }: FollowButtonProps) {
    const [isFollowed, setIsFollowed] = useState(isFollowedInitially);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        setIsLoading(true);
        // Optimistic
        setIsFollowed(!isFollowed);

        try {
            await followUser(userId);
        } catch (error) {
            // Revert
            setIsFollowed(!isFollowed);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isFollowed || isLoading}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${isFollowed
                    ? 'text-green-500 bg-green-100 cursor-default'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
            title={isFollowed ? "Followed" : "Follow"}
        >
            {isFollowed ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </button>
    );
}
