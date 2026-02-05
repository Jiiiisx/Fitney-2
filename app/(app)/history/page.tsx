"use client";

import { useState, useEffect } from "react";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Filter, Clock, ArrowUpDown, Dumbbell, Calendar, Flame, Timer, TrendingUp } from "lucide-react";
import { fetchWithAuth } from "@/app/lib/fetch-helper";

interface HistoryStats {
  totalWorkouts: number;
  totalCalories: number;
  avgDuration: number;
  thisMonthCount: number;
}

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetchWithAuth('/api/stats/history-summary');
        setStats(response);
      } catch (err) {
        console.error("Failed to fetch history stats", err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50/50 to-white dark:from-black dark:to-neutral-950">
      <div className="max-w-[1600px] mx-auto space-y-10 px-6 py-10 md:p-12 animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white">Training History</h1>
            <p className="text-muted-foreground font-medium text-sm md:text-base italic">Every drop of sweat is a step closer to your goals.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
             <TrendingUp className="w-4 h-4" />
             <span className="text-xs font-black uppercase tracking-widest">Consistency is Key</span>
          </div>
        </div>

        {/* QUICK INSIGHTS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Workouts', value: stats?.totalWorkouts || 0, icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
             { label: 'Calories Burned', value: stats?.totalCalories ? `${Math.round(stats.totalCalories / 1000)}k` : 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
             { label: 'Avg. Duration', value: stats?.avgDuration ? `${Math.round(stats.avgDuration)}m` : '0m', icon: Timer, color: 'text-purple-500', bg: 'bg-purple-500/10' },
             { label: 'This Month', value: stats?.thisMonthCount || 0, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
           ].map((item, i) => (
             <div key={i} className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300">
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                   <item.icon className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{item.label}</p>
                   <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter">
                     {loadingStats ? '...' : item.value}
                   </p>
                </div>
             </div>
           ))}
        </div>

        <div className="h-px bg-neutral-200 dark:bg-neutral-800/50 w-full" />

        {/* TOOLBAR: FILTERS & CONTROLS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Side: Filtering */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter By</span>
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px] h-10 rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-bold text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="w-3.5 h-3.5 text-blue-500" />
                            <SelectValue placeholder="Type" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl">
                        <SelectItem value="all" className="rounded-xl font-bold">All Types</SelectItem>
                        <SelectItem value="strength" className="rounded-xl font-bold">Strength</SelectItem>
                        <SelectItem value="cardio" className="rounded-xl font-bold">Cardio</SelectItem>
                        <SelectItem value="flexibility" className="rounded-xl font-bold">Flexibility</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterDuration} onValueChange={setFilterDuration}>
                    <SelectTrigger className="w-[150px] h-10 rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-bold text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <SelectValue placeholder="Duration" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl">
                        <SelectItem value="all" className="rounded-xl font-bold">All Durations</SelectItem>
                        <SelectItem value="short" className="rounded-xl font-bold">Short (&lt;15m)</SelectItem>
                        <SelectItem value="medium" className="rounded-xl font-bold">Medium (15-45m)</SelectItem>
                        <SelectItem value="long" className="rounded-xl font-bold">Long (&gt;45m)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Right Side: Sorting */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sort By</span>
                </div>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[160px] h-10 rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-bold text-xs shadow-sm">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-neutral-100 dark:border-neutral-800 shadow-xl">
                        <SelectItem value="newest" className="rounded-xl font-bold">Newest First</SelectItem>
                        <SelectItem value="oldest" className="rounded-xl font-bold">Oldest First</SelectItem>
                        <SelectItem value="calories" className="rounded-xl font-bold">Most Calories</SelectItem>
                        <SelectItem value="duration" className="rounded-xl font-bold">Longest Duration</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <HistoryWorkoutLog 
            filterType={filterType} 
            filterDuration={filterDuration} 
            sortOrder={sortOrder} 
        />
      </div>
    </div>
  );
}