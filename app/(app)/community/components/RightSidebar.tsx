import { Award, ArrowRight, Hash, User } from "lucide-react";
import Link from "next/link";
import { verifyAuth } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { getSuggestions, getTrendingHashtags, getTopAchievers } from "@/app/lib/community-data";
import FollowButton from "./FollowButton";

export default async function RightSidebar() {
    // Auth Check Server Side
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Quick verify without full req object? Or mock req? 
    // verifyAuth expects NextRequest, which we don't have exactly here in RSC easily without headers().
    // We can decode manually or make a helper. 
    // For now, let's assume we can get userId from token if we trust it, but better to verify.
    // Actually, simple decode for userId is enough if we trust the middleware protection, 
    // but better use the same `verifyAuth` if adaptable, or a new `getCurrentUser` helper.

    // Let's rely on a helper that reads cookies() directly.
    // We'll mock a request object or just parse token. 
    // Simpler: Just use `getUserFromToken` from auth lib if we export it!
    const { getUserFromToken } = await import("@/app/lib/auth");
    const userPayload = token ? await getUserFromToken(token) : null;
    const userId = userPayload?.userId;

    // Parallel Fetching
    const [suggestions, trendingTags, achievers] = await Promise.all([
        userId ? getSuggestions(userId) : Promise.resolve([]),
        getTrendingHashtags(),
        userId ? getTopAchievers(userId) : Promise.resolve([])
    ]);

    return (
        <div className="space-y-6">
            {/* Find Friends */}
            <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-foreground">
                        Find Friends
                    </h3>
                    <Link href="/community/find-friends" className="text-xs text-primary hover:underline flex items-center font-medium">
                        View All <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
                </div>

                {suggestions.length > 0 ? (
                    <ul className="space-y-4">
                        {suggestions.slice(0, 3).map((user: any) => (
                            <li key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.fullName}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-bold text-foreground text-sm truncate">{user.fullName || user.username}</p>
                                        <p className="text-xs text-muted-foreground truncate">Level {user.level || 1}</p>
                                    </div>
                                </div>
                                <FollowButton userId={user.id} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No new suggestions.</p>
                )}
            </div>

            {/* Top Friend Achievers */}
            <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
                    <Award className="w-5 h-5 mr-3 text-primary" />
                    Top Friend Achievers
                </h3>

                {achievers.length > 0 ? (
                    <ul className="space-y-3">
                        {achievers.map((achiever: any) => (
                            <li key={achiever.id} className={`flex items-center p-2 rounded-md ${achiever.isMe ? "bg-primary/5 border border-primary/20" : ""}`}>
                                <span className="text-xl mr-3 w-6 text-center">{achiever.rank}</span>
                                <div className="flex-1 min-w-0">
                                    <span className={`font-semibold block truncate ${achiever.isMe ? "text-primary" : "text-foreground"}`}>
                                        {achiever.name} {achiever.isMe && "(You)"}
                                    </span>
                                    <p className="text-sm text-muted-foreground">{achiever.stat}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        Add friends to see who's topping the leaderboard!
                    </div>
                )}
            </div>

            {/* Popular Topics (Dynamic) */}
            <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
                    <Hash className="w-5 h-5 mr-3 text-primary" />
                    Popular Topics
                </h3>
                {trendingTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {trendingTags.map((tag) => (
                            <Link 
                                href={`/community?hashtag=${tag.tag}`}
                                key={tag.tag} 
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                                #{tag.tag}
                                <span className="text-[10px] opacity-70">({tag.count})</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No trending topics yet.</p>
                )}
            </div>
        </div>
    );
};