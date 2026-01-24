"use client";

import { useState, useRef } from "react";
import { Plus, User, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useStories, uploadImage, createStory } from "../hooks/useCommunity";
import toast from "react-hot-toast";

interface Story {
    id: number;
    userId: string;
    mediaUrl: string;
    createdAt: string;
    user: {
        username: string;
        fullName: string;
        imageUrl: string;
    };
}

export default function StoryTray() {
    const { user } = useCurrentUser();
    const { stories, isLoading } = useStories();
    const [isUploading, setIsUploading] = useState(false);
    const [viewingUser, setViewingUser] = useState<string | null>(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Group stories by user
    const groupedStories = stories.reduce((acc: any, story: any) => {
        if (!acc[story.userId]) {
            acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
    }, {});

    const userIds = Object.keys(groupedStories);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Max file size 5MB");
                return;
            }

            setIsUploading(true);
            try {
                const url = await uploadImage(file);
                await createStory(url);
            } catch (error) {
                // handled in hook
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleViewStory = (userId: string) => {
        setViewingUser(userId);
        setStoryIndex(0);
    };

    const closeStory = () => {
        setViewingUser(null);
        setStoryIndex(0);
    };

    const currentStories = viewingUser ? groupedStories[viewingUser] : [];
    const currentStory = currentStories[storyIndex];

    return (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 overflow-x-auto custom-scrollbar">
            <div className="flex gap-4">
                {/* Create Story Button */}
                <div
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <div className="relative w-16 h-16 mb-1">
                        <div className={`w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="You" className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                            ) : (
                                <User className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 border-2 border-card">
                            <Plus className="w-3 h-3" />
                        </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                        {isUploading ? "Uploading..." : "Add Story"}
                    </span>
                </div>

                {/* Stories List */}
                {userIds.map((userId) => {
                    const userStories = groupedStories[userId];
                    const storyUser = userStories[0].user;
                    const isMyStory = user?.id === userId; // Assuming useCurrentUser returns `id`

                    return (
                        <div
                            key={userId}
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                            onClick={() => handleViewStory(userId)}
                        >
                            <div className="w-16 h-16 rounded-full p-[2px] mb-1 bg-gradient-to-tr from-yellow-400 to-red-500">
                                <div className="w-full h-full rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                                    {storyUser.imageUrl ? (
                                        <img src={storyUser.imageUrl} alt={storyUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-foreground max-w-[64px] truncate">
                                {isMyStory ? "Your Story" : (storyUser.fullName || storyUser.username)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Story Viewer Modal */}
            {viewingUser && currentStory && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <button
                        onClick={closeStory}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="max-w-md w-full relative">
                        {/* Progress Bar */}
                        <div className="absolute top-2 left-2 right-2 flex gap-1">
                            {currentStories.map((_: any, idx: number) => (
                                <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= storyIndex ? 'bg-white' : 'bg-white/30'}`} />
                            ))}
                        </div>

                        {/* Navigation Areas */}
                        <div className="absolute inset-y-0 left-0 w-1/3" onClick={() => {
                            if (storyIndex > 0) setStoryIndex(prev => prev - 1);
                        }}></div>
                        <div className="absolute inset-y-0 right-0 w-1/3" onClick={() => {
                            if (storyIndex < currentStories.length - 1) setStoryIndex(prev => prev + 1);
                            else closeStory();
                        }}></div>

                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full rounded-lg max-h-[80vh] object-contain"
                        />

                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                                {currentStory.user.imageUrl ? (
                                    <img src={currentStory.user.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-white m-2" />
                                )}
                            </div>
                            <span className="text-white font-medium text-sm text-shadow">
                                {currentStory.user.fullName || currentStory.user.username}
                            </span>
                            <span className="text-white/70 text-xs ml-2">
                                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
