"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, 
    Loader2, 
    Calendar, 
    Trophy, 
    MessageSquare, 
    Activity,
    UserPlus,
    UserCheck,
    Share2,
    Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FitnessPassport from "@/app/(app)/settings/components/FitnessPassport";
import PostCard from "@/app/(app)/community/components/PostCard";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/community/users/${username}/profile`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                } else {
                    toast.error("User not found");
                    router.push("/community");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Retrieving athlete data...</p>
        </div>
    );

    const { user, stats, posts, achievements } = data;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* TOP NAVIGATION */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                    }}>
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                        className={`rounded-full px-6 font-bold transition-all ${isFollowing ? 'bg-muted text-foreground border' : 'bg-primary text-primary-foreground'}`}
                        onClick={() => setIsFollowing(!isFollowing)}
                    >
                        {isFollowing ? <><UserCheck className="w-4 h-4 mr-2" /> Following</> : <><UserPlus className="w-4 h-4 mr-2" /> Follow</>}
                    </Button>
                </div>
            </div>

            {/* HEADER AREA */}
            <div className="relative">
                {/* Visual Cover Gradient */}
                <div className="h-48 w-full rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl opacity-20 absolute top-0 left-0 -z-10" />
                
                <div className="pt-12 px-4">
                    <div className="mb-4 flex justify-end">
                        {(user.role === 'pro' || user.role === 'premium') && (
                            <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white/20 animate-bounce">
                                <Crown className="w-4 h-4 fill-current" />
                                PRO ATHLETE
                            </div>
                        )}
                        {(user.role === 'elite' || user.role === 'admin') && (
                            <div className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-white/20 animate-bounce">
                                <Crown className="w-4 h-4 fill-current" />
                                ELITE ATHLETE
                            </div>
                        )}
                    </div>
                    <FitnessPassport 
                        user={{
                            fullName: user.fullName || user.username,
                            username: user.username,
                            level: user.level,
                            xp: user.xp,
                            joinedAt: new Date(user.createdAt)
                        }}
                        stats={{
                            totalWorkouts: stats.totalWorkouts,
                            streak: stats.streak || 0,
                            totalMinutes: stats.totalCalories ? Math.floor(stats.totalCalories / 7) : 0 // Rough estimation based on calories
                        }}
                    />
                </div>
            </div>

            {/* CONTENT TABS */}
            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="w-full justify-center bg-transparent border-b rounded-none h-auto p-0 mb-8 gap-8">
                    <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-4 font-bold text-muted-foreground data-[state=active]:text-primary transition-all flex gap-2">
                        <MessageSquare className="w-4 h-4" /> Feed
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-4 font-bold text-muted-foreground data-[state=active]:text-primary transition-all flex gap-2">
                        <Trophy className="w-4 h-4" /> Badges
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-4 font-bold text-muted-foreground data-[state=active]:text-primary transition-all flex gap-2">
                        <Activity className="w-4 h-4" /> Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="space-y-6 max-w-2xl mx-auto">
                    {posts.length > 0 ? (
                        posts.map((post: any) => (
                            <PostCard 
                                key={post.id} 
                                post={{
                                    ...post, 
                                    user: {
                                        name: user.fullName || user.username,
                                        avatar: user.imageUrl,
                                        username: user.username,
                                        role: user.role
                                    }
                                }} 
                                currentUserId={null} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium italic">No posts shared yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="achievements" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {achievements.length > 0 ? (
                        achievements.map((acc: any) => (
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                key={acc.id} 
                                className="bg-card border rounded-[2rem] p-6 text-center shadow-sm"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="font-bold text-sm mb-1">{acc.name}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">{acc.description}</p>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-muted-foreground italic">No badges unlocked yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="stats" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Workout Volume
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b pb-2">
                                <span className="text-sm font-bold text-muted-foreground">Total Sessions</span>
                                <span className="text-3xl font-black italic">{stats.totalWorkouts}</span>
                            </div>
                            <div className="flex justify-between items-end border-b pb-2">
                                <span className="text-sm font-bold text-muted-foreground">Est. Calories Burned</span>
                                <span className="text-3xl font-black italic">{stats.totalCalories} <span className="text-sm uppercase not-italic">kcal</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-500" /> Consistency
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Activity in last 28 days</p>
                        <div className="grid grid-cols-7 gap-2">
                            {stats.heatmap?.map((day: any, i: number) => (
                                <div 
                                    key={i} 
                                    title={day.date}
                                    className={`h-4 rounded-sm transition-all ${day.active ? 'bg-primary shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-muted opacity-40'}`} 
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 uppercase font-bold tracking-widest">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
