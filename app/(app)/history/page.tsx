"use client";

import { useState } from "react";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Filter, Clock, ArrowUpDown, Dumbbell } from "lucide-react";

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  return (
    <>
      <div className="space-y-8 px-6 py-8 md:p-8">
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
                    <Select value={filterType} onValueChange={setFilterType}>
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
                            <SelectItem value="flexibility">Flexibility</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter by Duration */}
                    <Select value={filterDuration} onValueChange={setFilterDuration}>
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

                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-[140px] h-9 bg-background">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="calories">Most Calories</SelectItem>
                            <SelectItem value="duration">Longest Duration</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <HistoryWorkoutLog 
            filterType={filterType} 
            filterDuration={filterDuration} 
            sortOrder={sortOrder} 
        />
      </div>
    </>
  );
}