"use client";

import { motion } from "framer-motion";
import { Trophy, Crown, Flame, Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/app/lib/utils";

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
    // XP Logic (consistent with backend)
    const xpForNextLevel = Math.floor(100 * Math.pow(user.level, 1.5));
    const progress = Math.min(100, (user.xp / xpForNextLevel) * 100);

    // Determine Rank Name based on level
    const getRankName = (level: number) => {
        if (level >= 50) return "LEGEND";
        if (level >= 30) return "MYTHIC";
        if (level >= 15) return "ELITE";
        if (level >= 5) return "PRO";
        return "ROOKIE";
    };

    const rankName = getRankName(user.level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[#2D0B5A] text-white relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                
                {/* Grainy Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* LEFT: MAIN INFO */}
                        <div className="p-8 sm:p-10 flex-1 relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 opacity-60">
                                        <Star className="w-3 h-3 fill-current" />
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Fitney Passport</h2>
                                    </div>
                                    <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter leading-none pt-2">
                                        {user.fullName}
                                    </h1>
                                    <p className="text-sm font-bold text-primary/80 tracking-wide">@{user.username}</p>
                                </div>
                                
                                <div className="pt-2">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 shadow-xl">
                                        <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Member</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Level</p>
                                    <p className="text-4xl sm:text-5xl font-black italic tracking-tighter">{user.level}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Workouts</p>
                                    <p className="text-4xl sm:text-5xl font-black italic tracking-tighter">{stats.totalWorkouts}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Streak</p>
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 fill-current drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                        <p className="text-4xl sm:text-5xl font-black italic tracking-tighter text-orange-500">{stats.streak}</p>
                                    </div>
                                </div>
                            </div>

                            {/* XP Progress Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-cyan-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">XP Progress</span>
                                    </div>
                                    <span className="text-xs font-black tracking-tight">
                                        <span className="text-white">{user.xp}</span>
                                        <span className="text-white/40 mx-1">/</span>
                                        <span className="text-white/40">{xpForNextLevel} XP</span>
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-black/40 rounded-full p-1 border border-white/5 relative overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full relative shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: RANK BADGE */}
                        <div className="relative w-full md:w-64 flex flex-col items-center justify-center p-8 overflow-hidden group">
                            {/* Inner Glass Box */}
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border-l border-white/10 hidden md:block"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 p-1 shadow-[0_0_50px_rgba(234,179,8,0.3)] mb-6 flex items-center justify-center"
                                >
                                    <div className="w-full h-full rounded-full bg-[#2D0B5A] flex items-center justify-center border-4 border-white/10">
                                        <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                                    </div>
                                </motion.div>
                                
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/80">Current Rank</p>
                                    <p className="text-3xl font-black italic tracking-tighter uppercase">{rankName}</p>
                                </div>
                            </div>

                            {/* Decorative flare */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}