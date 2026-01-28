import React, { forwardRef } from 'react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Flame, Timer, Dumbbell, Trophy, Activity, Calendar } from "lucide-react";

export interface WorkoutShareData {
  type: string;
  durationMinutes: number;
  caloriesBurned: number;
  date: Date;
  workoutName: string;
  totalVolume?: number; // kg used
  avgHeartRate?: number;
  user: {
    name: string;
    username: string;
    avatarUrl?: string; // Optional if we want to show user avatar
  };
}

interface WorkoutShareCardProps {
  data: WorkoutShareData;
  theme: 'classic' | 'photo' | 'fire';
  customImage?: string | null; // Data URL for the photo background
  className?: string;
}

// We use forwardRef to allow the parent (Modal) to capture this DOM element
const WorkoutShareCard = forwardRef<HTMLDivElement, WorkoutShareCardProps>(
  ({ data, theme, customImage, className }, ref) => {
    
    // Base container styles (Fixed aspect ratio 9:16 for stories mostly, but we define width/height explicitly for capture)
    // Width 400px is a good base for generation
    const baseClasses = "w-[400px] h-[711px] relative overflow-hidden flex flex-col antialiased bg-background text-foreground select-none";

    // Theme specific styles
    const themeStyles = {
      classic: "bg-zinc-950 text-white",
      photo: "bg-zinc-900 text-white",
      fire: "bg-gradient-to-br from-orange-600 via-red-600 to-rose-900 text-white",
    };

    return (
      <div 
        ref={ref} 
        className={cn(baseClasses, themeStyles[theme], className)}
        id="fitney-share-card"
      >
        {/* Background Image handling for 'photo' theme */}
        {theme === 'photo' && customImage && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={customImage} 
              alt="Workout Selfie" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Gradient Overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
          </div>
        )}

        {/* Decorative Circles for non-photo themes */}
        {theme !== 'photo' && (
          <>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          </>
        )}

        {/* --- CONTENT LAYER (z-10) --- */}
        <div className="relative z-10 flex flex-col h-full p-8 justify-between">
          
          {/* HEADER: Date & Branding */}
          <div className="flex justify-between items-start">
             <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider opacity-70 uppercase">
                    {format(data.date, "EEEE, d MMM yyyy")}
                </span>
                <span className="text-2xl font-black italic tracking-tighter">
                    FITNEY
                </span>
             </div>
             {/* Simple Logo Placeholder or Icon */}
             <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-6 w-6" />
             </div>
          </div>

          {/* MIDDLE: Big Stats */}
          <div className="flex flex-col gap-6 my-auto">
             <div>
                <h2 className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Workout Complete</h2>
                <h1 className="text-4xl font-extrabold leading-tight">
                    {data.workoutName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                        {data.type}
                    </span>
                    {data.totalVolume && (
                         <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                            {data.totalVolume}kg Lifted
                        </span>
                    )}
                </div>
             </div>

             {/* Grid Stats */}
             <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                        <Timer className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Duration</span>
                    </div>
                    <p className="text-3xl font-bold">{data.durationMinutes}<span className="text-lg font-medium opacity-60 ml-1">min</span></p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-bold uppercase">Calories</span>
                    </div>
                    <p className="text-3xl font-bold">{data.caloriesBurned}<span className="text-lg font-medium opacity-60 ml-1">kcal</span></p>
                </div>
             </div>
          </div>

          {/* FOOTER: User Info & Call to Action */}
          <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-lg border-2 border-white/20">
                    {data.user.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold leading-none">{data.user.name}</span>
                    <span className="text-xs opacity-60">@{data.user.username}</span>
                </div>
            </div>

            {/* Quote / Gamification Element */}
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-yellow-400">
                    <Trophy className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold">Level Up!</span>
                </div>
                <p className="text-[10px] opacity-50 mt-1">Get Fitney on App Store</p>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

WorkoutShareCard.displayName = "WorkoutShareCard";

export default WorkoutShareCard;
