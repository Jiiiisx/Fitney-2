"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, Activity, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface FitnessPassportProps {
    user: {
        fullName: string;
        username: string;
        level: number;
        xp: number;
        joinedAt: Date;
    };
    stats: {
        totalWorkouts: number;
        streak: number;
        totalMinutes: number;
    };
}

export default function FitnessPassport({ user, stats }: FitnessPassportProps) {
    // XP Logic (simplified)
    const xpForNextLevel = Math.floor(100 * Math.pow(user.level, 1.5));
    const progress = Math.min(100, (user.xp / xpForNextLevel) * 100);

    return (
        <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
            
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* LEFT: ID CARD STYLE */}
                    <div className="p-8 flex-1 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Fitney Passport</h2>
                                <h1 className="text-3xl font-black italic tracking-tight">{user.fullName}</h1>
                                <p className="text-sm font-medium text-zinc-400">@{user.username}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/20">
                                    <Crown className="w-3 h-3" />
                                    <span className="text-xs font-black uppercase">PRO MEMBER</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Level</p>
                                <p className="text-4xl font-black font-mono">{user.level}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Workouts</p>
                                <p className="text-4xl font-black font-mono">{stats.totalWorkouts}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Streak</p>
                                <div className="flex items-center gap-1 text-orange-500">
                                    <Flame className="w-5 h-5 fill-current" />
                                    <p className="text-4xl font-black font-mono">{stats.streak}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-400">XP Progress</span>
                                <span className="text-white">{user.xp} / {xpForNextLevel} XP</span>
                            </div>
                            <Progress value={progress} className="h-3 bg-zinc-700" indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-400" />
                        </div>
                    </div>

                    {/* RIGHT: BADGES / RELIC */}
                    <div className="bg-white/5 p-8 w-full md:w-48 flex flex-col items-center justify-center border-l border-white/5">
                         <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,165,0,0.3)] mb-4 animate-pulse">
                            <Trophy className="w-12 h-12 text-white" />
                         </div>
                         <p className="text-xs font-bold text-center uppercase tracking-widest text-yellow-500">Current Rank</p>
                         <p className="text-lg font-black text-center italic">ELITE</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
