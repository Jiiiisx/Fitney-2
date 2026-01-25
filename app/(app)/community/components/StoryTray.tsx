"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, User, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useStories, uploadImage, createStory, markStoryAsViewedAction } from "../hooks/useCommunity";
import { mutate } from "swr";
import toast from "react-hot-toast";

const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryTray() {
    const { user } = useCurrentUser();
    const { stories, isLoading } = useStories();
    const [isUploading, setIsUploading] = useState(false);
    const [viewingUser, setViewingUser] = useState<string | null>(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Group stories by user
    const groupedStories = stories.reduce((acc: any, story: any) => {
        if (!acc[story.userId]) {
            acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
    }, {});

    const userIds = Object.keys(groupedStories).filter(id => id !== user?.id);
    const myStories = user?.id ? groupedStories[user.id] || [] : [];
    const hasMyStories = myStories.length > 0;
    const allMyStoriesViewed = hasMyStories && myStories.every((s: any) => s.isViewed);

    const currentStories = viewingUser ? groupedStories[viewingUser] : [];
    const currentStory = currentStories[storyIndex];

    const closeStory = () => {
        setViewingUser(null);
        setStoryIndex(0);
        mutate("/api/community/stories"); // Final sync on close
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (storyIndex < currentStories.length - 1) {
            setStoryIndex(prev => prev + 1);
        } else {
            // Get all userIds including self if self has stories for navigation
            const navigationUserIds = hasMyStories ? [user!.id, ...userIds] : userIds;
            const currentUserIdx = navigationUserIds.indexOf(viewingUser!);
            
            if (currentUserIdx < navigationUserIds.length - 1) {
                setViewingUser(navigationUserIds[currentUserIdx + 1]);
                setStoryIndex(0);
            } else {
                closeStory();
            }
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (storyIndex > 0) {
            setStoryIndex(prev => prev - 1);
        } else {
            const navigationUserIds = hasMyStories ? [user!.id, ...userIds] : userIds;
            const currentUserIdx = navigationUserIds.indexOf(viewingUser!);
            
            if (currentUserIdx > 0) {
                const prevUserId = navigationUserIds[currentUserIdx - 1];
                setViewingUser(prevUserId);
                setStoryIndex(groupedStories[prevUserId].length - 1);
            }
        }
    };

    // Auto-advance logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (viewingUser && currentStory) {
            setProgress(0);
            markStoryAsViewedAction(currentStory.id);
            
            // Progress bar interval (smooth update)
            const startTime = Date.now();
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = (elapsed / STORY_DURATION) * 100;
                setProgress(Math.min(newProgress, 100));
            }, 50);

            // Advance story timer
            timer = setTimeout(() => {
                handleNext();
            }, STORY_DURATION);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [viewingUser, storyIndex]);

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

    return (
        <div className="bg-card p-4 sm:p-4 rounded-xl border border-border shadow-sm mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4">
                {/* Combined Add Story / View My Story Button */}
                <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <div className="relative w-16 h-16 mb-1">
                        <div 
                            onClick={() => hasMyStories ? handleViewStory(user!.id) : fileInputRef.current?.click()}
                            className={cn(
                                "w-16 h-16 rounded-full p-[2px] transition-transform active:scale-95",
                                hasMyStories 
                                    ? (allMyStoriesViewed ? 'bg-muted border border-border' : 'bg-gradient-to-tr from-yellow-400 to-red-500')
                                    : ""
                            )}
                        >
                            <div className={cn(
                                "w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-card",
                                !hasMyStories && "border-dashed border-primary/50"
                            )}>
                                {user?.imageUrl ? (
                                    <img src={user.imageUrl} alt="You" className={cn("w-full h-full object-cover", !hasMyStories && "opacity-70 group-hover:opacity-100")} />
                                ) : (
                                    <User className="w-8 h-8 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        
                        {/* Plus badge for adding story */}
                        <div 
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 border-2 border-card hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                        {isUploading ? "Uploading..." : (hasMyStories ? "Your Story" : "Add Story")}
                    </span>
                </div>

                {/* Other Users' Stories List */}
                {userIds.map((userId) => {
                    const userStories = groupedStories[userId];
                    const storyUser = userStories[0].user;
                    const allViewed = userStories.every((s: any) => s.isViewed);

                    return (
                        <div
                            key={userId}
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                            onClick={() => handleViewStory(userId)}
                        >
                            <div className={`w-16 h-16 rounded-full p-[2px] mb-1 transition-transform active:scale-95 ${allViewed ? 'bg-muted border border-border' : 'bg-gradient-to-tr from-yellow-400 to-red-500'}`}>
                                <div className="w-full h-full rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden">
                                    {storyUser.imageUrl ? (
                                        <img src={storyUser.imageUrl} alt={storyUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-foreground max-w-[64px] truncate">
                                {storyUser.fullName || storyUser.username}
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
                        className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 z-50 transition-colors"
                    >
                        <X className="w-10 h-10" />
                    </button>

                    {/* External Navigation Arrows */}
                    <button 
                        onClick={handlePrev}
                        className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full hidden md:flex items-center justify-center text-white transition-all z-50"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button 
                        onClick={handleNext}
                        className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full hidden md:flex items-center justify-center text-white transition-all z-50"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="w-full h-full md:h-auto md:max-w-md relative flex flex-col justify-center">
                        {/* Progress Bar */}
                        <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-30">
                            {currentStories.map((_: any, idx: number) => (
                                <div key={idx} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                                    <div 
                                        className="h-full bg-white transition-all duration-50"
                                        style={{ 
                                            width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%' 
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Internal Invisible Navigation Areas (for touch/feel) */}
                        <div className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer" onClick={handlePrev}></div>
                        <div className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer" onClick={handleNext}></div>

                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full md:h-auto md:max-h-[85vh] md:rounded-2xl shadow-2xl object-contain bg-black"
                        />

                        <div className="absolute bottom-4 left-4 flex items-center gap-2 z-30">
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