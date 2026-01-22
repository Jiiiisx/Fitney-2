"use client";

import { useState, useEffect } from "react";
import { Search, Dumbbell, Clock, Calendar as CalendarIcon, Check, ChevronLeft, Flame, Plus, History, Footprints, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface Exercise {
  id: number;
  name: string;
  category: string;
}

interface LogWorkoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "log" | "plan";
}

// Dummy recent workouts for demo (In real app, fetch from API)
const RECENT_WORKOUTS = [
  { id: 101, name: "Push Up", category: "Strength" },
  { id: 102, name: "Running", category: "Cardio" },
  { id: 103, name: "Squat", category: "Strength" },
];

export default function LogWorkoutForm({ onSuccess, onCancel, mode = "log" }: LogWorkoutFormProps) {
  // --- STATE ---
  const [step, setStep] = useState<"search" | "details">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual Category Override
  const [manualCategory, setManualCategory] = useState<string>("");

  // Smart Mode Management
  const [internalMode, setInternalMode] = useState<"log" | "plan">(mode);
  const [dateStatus, setDateStatus] = useState<"past" | "today" | "future">("today");

  // Form Data
  const [formData, setFormData] = useState({
    sets: "3",
    reps: "10",
    weight: "0",
    duration: "30",
    distance: "0",
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const searchExercises = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Search failed", error);
      }
    };

    const timeoutId = setTimeout(() => {
      searchExercises();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Determine initial category from exercise data or name if category is generic/missing
    let initialCat = exercise.category || "Strength";
    
    // Auto-detect based on name keywords if category is generic
    if (exercise.name.toLowerCase().includes("run") || exercise.name.toLowerCase().includes("cardio")) {
        initialCat = "Cardio";
    } else if (exercise.name.toLowerCase().includes("yoga") || exercise.name.toLowerCase().includes("stretch")) {
        initialCat = "Flexibility";
    }

    setManualCategory(initialCat); 
    setStep("details");
    setSearchQuery(""); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Dynamic Type Checks based on Manual Category
  // Prioritize manualCategory state which is driven by the Select
  const isCardio = manualCategory === "Cardio";
  const isDurationOnly = manualCategory === "Flexibility";
  // If neither is true, it defaults to Strength logic (shown when !isCardio && !isDurationOnly)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      let endpoint = "/api/workouts/log";
      let payload: any = {};
      


      if (internalMode === "log") {
          endpoint = "/api/workouts/log";
          payload = {
            exerciseId: selectedExercise?.id,
            name: selectedExercise?.name,
            type: isCardio ? "Cardio" : "Strength", 
            sets: isCardio ? null : Number(formData.sets),
            reps: isCardio ? null : formData.reps,
            weight: isCardio ? null : Number(formData.weight),
            duration: Number(formData.duration),
            distance: isCardio ? Number(formData.distance) : null,
            date: formData.date
          };
      } else {
          // PLAN MODE
          endpoint = "/api/planner/day";
          payload = {
            name: selectedExercise?.name, 
            date: formData.date,
            exercises: [{
                id: selectedExercise?.id,
                sets: isCardio ? null : Number(formData.sets),
                reps: isCardio ? null : formData.reps,
                duration: Number(formData.duration) 
            }]
          };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      // Success Messages
      if (internalMode === "log") {
        toast.success(
            <div className="flex flex-col">
            <span className="font-bold">Workout Logged!</span>
            <span className="text-sm flex items-center gap-1">
                <Flame size={14} className="text-orange-500" /> 
                You gained {data.xpGained} XP!
            </span>
            </div>
        );
        if (data.leveledUp) toast("LEVEL UP! 🎉", { icon: "⭐" });
      } else {
        toast.success("Workout Scheduled!");
      }

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      toast.error("Failed to save workout");
    } finally {
      setIsLoading(false);
    }
  };



  // --- RENDER: STEP 1 (SEARCH) ---
  if (step === "search") {
    return (
      <div className="space-y-4">
        <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <History className="w-3 h-3" /> Quick Select
            </h4>
            <div className="flex flex-wrap gap-2">
                {RECENT_WORKOUTS.map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => handleSelectExercise(ex)}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-xs font-medium transition-colors border"
                    >
                        {ex.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="relative border rounded-lg shadow-sm">
            <Command className="rounded-lg border-none">
            <CommandInput 
                placeholder="Search exercises..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                autoFocus
                className="border-none focus:ring-0"
            />
            <CommandList className="max-h-[250px] overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    {searchQuery.length > 0 ? (
                        <div className="flex flex-col items-center gap-2">
                            <span>No results found.</span>
                            {searchQuery.length > 2 && (
                                <button 
                                    onClick={() => handleSelectExercise({ id: 0, name: searchQuery, category: "Custom" })}
                                    className="text-blue-500 hover:underline font-medium"
                                >
                                    + Create "{searchQuery}"
                                </button>
                            )}
                        </div>
                    ) : "Start typing to search..."}
                </CommandEmpty>
                
                {searchResults.length > 0 && (
                    <CommandGroup heading="Results">
                        {searchResults.map((ex) => (
                            <CommandItem key={ex.id} onSelect={() => handleSelectExercise(ex)} className="cursor-pointer">
                                <Dumbbell className="mr-2 h-4 w-4 opacity-50" />
                                <span>{ex.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground capitalize">{ex.category}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
            </Command>
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 2 (DETAILS) ---
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setStep("search")}
            className="h-8 w-8 -ml-2"
        >
            <ChevronLeft size={18} />
        </Button>
            <div>
                <h3 className="font-bold text-lg leading-none">{selectedExercise?.name}</h3>
                
                {/* Replaced Static Type Display with Selector */}
                <div className="mt-1 flex items-center">
                    <Select value={manualCategory} onValueChange={(val) => setManualCategory(val)}>
                        <SelectTrigger className="h-7 text-xs px-2 w-auto min-w-[140px] gap-2 border bg-muted/50 hover:bg-muted focus:ring-0 shadow-sm rounded-md">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem value="Strength">
                                <div className="flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4 text-orange-500" /> 
                                    <span>Strength Training</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Cardio">
                                <div className="flex items-center gap-2">
                                    <Footprints className="w-4 h-4 text-green-500" /> 
                                    <span>Cardio / Endurance</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Flexibility">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" /> 
                                    <span>Duration Based</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
      </div>

      {/* Date Input & Status Indicator */}
      <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
         <div className="flex justify-between items-center mb-1">
            <Label htmlFor="date" className="text-xs font-bold uppercase text-muted-foreground">Date</Label>
            
            {/* Mode Indicator / Switcher */}
            {dateStatus === "past" && (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Completed (Log)
                </span>
            )}
            {dateStatus === "future" && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" /> Scheduled (Plan)
                </span>
            )}
            {dateStatus === "today" && (
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setInternalMode("log")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${internalMode === 'log' ? 'bg-green-100 text-green-700 border-green-200' : 'text-muted-foreground border-transparent hover:bg-muted'}`}
                    >
                        Done
                    </button>
                    <button 
                        type="button"
                        onClick={() => setInternalMode("plan")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${internalMode === 'plan' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-muted-foreground border-transparent hover:bg-muted'}`}
                    >
                        Plan
                    </button>
                </div>
            )}
         </div>
         <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                id="date" name="date" type="date"
                className="pl-9 bg-white dark:bg-black/20"
                value={formData.date} onChange={handleInputChange}
            />
         </div>
         <p className="text-[10px] text-muted-foreground">
            {internalMode === 'log' ? "This will be recorded in your history." : "This will be added to your planner."}
         </p>
      </div>

      {/* Stats Grid - Dynamic based on Type */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* FIELDS FOR STRENGTH */}
        {!isCardio && !isDurationOnly && (
            <>
                <div className="space-y-1.5">
                    <Label htmlFor="sets" className="text-xs font-semibold uppercase text-muted-foreground">Sets</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 font-bold text-muted-foreground text-xs">x</div>
                        <Input 
                            id="sets" name="sets" type="number" 
                            className="pl-7 bg-muted/20" 
                            value={formData.sets} onChange={handleInputChange} 
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <Label htmlFor="reps" className="text-xs font-semibold uppercase text-muted-foreground">Reps</Label>
                    <div className="relative">
                        <RefreshCw className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input 
                            id="reps" name="reps" placeholder="e.g. 10"
                            className="pl-8 bg-muted/20"
                            value={formData.reps} onChange={handleInputChange} 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-xs font-semibold uppercase text-muted-foreground">Weight (kg)</Label>
                    <div className="relative">
                        <Dumbbell className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="weight" name="weight" type="number" step="0.5"
                            className="pl-9 bg-muted/20"
                            value={formData.weight} onChange={handleInputChange} 
                        />
                    </div>
                </div>
            </>
        )}

        {/* FIELDS FOR CARDIO */}
        {isCardio && !isDurationOnly && (
             <div className="space-y-1.5">
                <Label htmlFor="distance" className="text-xs font-semibold uppercase text-muted-foreground">Distance (km)</Label>
                <div className="relative">
                    <Footprints className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="distance" name="distance" type="number" step="0.1"
                        className="pl-9 bg-muted/20"
                        value={formData.distance} onChange={handleInputChange} 
                    />
                </div>
            </div>
        )}

        {/* Duration (Common for All) */}
        <div className={`space-y-1.5 ${isDurationOnly ? 'col-span-2' : ''}`}>
            <Label htmlFor="duration" className="text-xs font-semibold uppercase text-muted-foreground">Duration (min)</Label>
            <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="duration" name="duration" type="number" 
                    className="pl-9 bg-muted/20" 
                    value={formData.duration} onChange={handleInputChange} 
                />
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            Cancel
        </Button>
        <Button 
            type="submit" 
            className={`flex-1 ${internalMode === 'log' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
            disabled={isLoading}
        >
            {isLoading ? "Saving..." : (internalMode === "log" ? "Log Workout" : "Save Plan")}
        </Button>
      </div>
    </form>
  );
}
