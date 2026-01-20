"use client";

import { useState } from "react";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Plus, Filter, Clock, ArrowUpDown, Dumbbell } from "lucide-react";
import { LogWorkoutModal } from "../components/forms/LogWorkoutModal";

export default function HistoryPage() {
  const [isLogModalOpen, setLogModalOpen] = useState(false);

  return (
    <>
      <LogWorkoutModal isOpen={isLogModalOpen} onOpenChange={setLogModalOpen} />
      <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Workout Diary</h1>
                <p className="text-muted-foreground mt-1">Track your progress and view past activities.</p>
            </div>
             <Button 
                onClick={() => setLogModalOpen(true)} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all hover:scale-105"
            >
                <Plus className="w-5 h-5 mr-2" />
                Log Workout
            </Button>
        </div>
 
        {/* Filters & Controls Toolbar */}
        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/60 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                
                {/* Left Side: Filtering */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    
                    {/* Filter by Type */}
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] h-9 bg-background">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter by Duration */}
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[150px] h-9 bg-background">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Duration" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Durations</SelectItem>
                            <SelectItem value="short">Short (&lt;15m)</SelectItem>
                            <SelectItem value="medium">Medium (15-45m)</SelectItem>
                            <SelectItem value="long">Long (&gt;45m)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Right Side: Sorting */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Sort:</span>
                    </div>

                    <Select defaultValue="newest">
                        <SelectTrigger className="w-[140px] h-9 bg-background">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="calories">Most Calories</SelectItem>
                            <SelectItem value="duration">Longest Duration</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <HistoryWorkoutLog />
      </div>
    </>
  );
}