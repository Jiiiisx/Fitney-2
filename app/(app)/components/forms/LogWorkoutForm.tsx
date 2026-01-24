"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Dumbbell, Clock, Calendar as CalendarIcon, Check,
  ChevronLeft, Flame, Plus, History, Footprints, RefreshCw,
  ChevronsUpDown, Heart, X, Loader2
} from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Types
type ExerciseInput = {
  id: number | null;
  name: string;
  type: 'Strength' | 'Cardio';
  sets: string;
  reps: string;
  duration: string;
  weight: string;
  distance: string;
};

type ApiExercise = {
  id: number;
  name: string;
  category: string;
};

interface LogWorkoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "log" | "plan";
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function LogWorkoutForm({ onSuccess, onCancel, mode = "log" }: LogWorkoutFormProps) {
  // --- STATE ---
  const [step, setStep] = useState<"name" | "details">("name");
  const [sessionName, setSessionName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalMode, setInternalMode] = useState<"log" | "plan">(mode);

  // Exercises List State
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: null, name: '', type: 'Strength', sets: '3', reps: '10', duration: '30', weight: '0', distance: '0' }
  ]);

  // Search State
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiExercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // --- SEARCH EXERCISES ---
  useEffect(() => {
    const search = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/exercises/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedSearchQuery]);

  // --- HANDLERS ---
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }
    setStep("details");
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseInput, value: any) => {
    const newExercises = [...exercises];
    (newExercises[index] as any)[field] = value;
    setExercises(newExercises);
  };

  const addExerciseRow = () => {
    setExercises([...exercises, { id: null, name: '', type: 'Strength', sets: '3', reps: '10', duration: '30', weight: '0', distance: '0' }]);
  };

  const removeExerciseRow = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSelectExercise = (index: number, exercise: ApiExercise) => {
    handleExerciseChange(index, 'id', exercise.id);
    handleExerciseChange(index, 'name', exercise.name);

    // Auto-detect type
    let type: 'Strength' | 'Cardio' = 'Strength';
    if (exercise.name.toLowerCase().includes("run") || exercise.name.toLowerCase().includes("cardio") || exercise.category === "Cardio") {
      type = 'Cardio';
    }
    handleExerciseChange(index, 'type', type);
    setPopoverOpen(null);
    setSearchQuery("");
  };

  const handleCreateCustom = (index: number, name: string) => {
    handleExerciseChange(index, 'id', 0); // 0 = Custom
    handleExerciseChange(index, 'name', name);
    setPopoverOpen(null);
    setSearchQuery("");
  };

  const handleSubmit = async () => {
    // Validate
    if (exercises.some(ex => !ex.name)) {
      toast.error("Please select an exercise for all rows");
      return;
    }

    setIsLoading(true);
    try {
      if (internalMode === "plan") {
        // --- PLAN MODE (Bulk Insert) ---
        const payload = {
          name: sessionName,
          date: date,
          exercises: exercises.map(ex => ({
            id: ex.id || 0,
            name: ex.name,
            sets: ex.type === 'Cardio' ? null : Number(ex.sets),
            reps: ex.type === 'Cardio' ? null : ex.reps,
            duration: Number(ex.duration) // mins
          }))
        };

        const res = await fetch("/api/planner/day", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save plan");
        toast.success("Workout Plan Saved!");

      } else {
        // --- LOG MODE (Sequential Insert) ---
        let totalXp = 0;
        let leveledUp = false;

        for (const ex of exercises) {
          const payload = {
            exerciseId: ex.id || 0,
            name: ex.name, // Pass name for custom exercises
            type: ex.type,
            sets: ex.type === 'Cardio' ? null : Number(ex.sets),
            reps: ex.type === 'Cardio' ? null : ex.reps,
            weight: ex.type === 'Cardio' ? null : Number(ex.weight),
            duration: Number(ex.duration),
            distance: ex.type === 'Cardio' ? Number(ex.distance) : null,
            date: date
          };

          const res = await fetch("/api/workouts/log", {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            totalXp += data.xpGained || 0;
            if (data.leveledUp) leveledUp = true;
          }
        }

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Workout Logged!</span>
            <span className="text-sm flex items-center gap-1">
              <Flame size={14} className="text-orange-500" />
              You gained {totalXp} XP!
            </span>
          </div>
        );
        if (leveledUp) toast("LEVEL UP! 🎉", { icon: "⭐" });
      }

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      toast.error("Failed to save workout");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER: STEP 1 (NAME) ---
  if (step === "name") {
    return (
      <form onSubmit={handleNextStep} className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            Enter Workout Name
          </h4>
        </div>

        <div className="relative">
          <Input
            placeholder="Title (e.g. Morning Run)..."
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            autoFocus
            className="text-lg font-semibold"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="w-full">
            Next
          </Button>
        </div>
      </form>
    );
  }

  // --- RENDER: STEP 2 (DETAILS) ---
  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setStep("name")}
          className="h-8 w-8 -ml-2"
        >
          <ChevronLeft size={18} />
        </Button>
        <div className="flex-1">
          <h3 className="font-bold text-lg leading-none truncate">{sessionName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setInternalMode("log")}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", internalMode === 'log' ? "bg-green-100 text-green-700 border-green-200 font-bold" : "text-muted-foreground border-transparent hover:bg-muted")}
            >
              Log Done
            </button>
            <button
              onClick={() => setInternalMode("plan")}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors", internalMode === 'plan' ? "bg-blue-100 text-blue-700 border-blue-200 font-bold" : "text-muted-foreground border-transparent hover:bg-muted")}
            >
              Plan Later
            </button>
          </div>
        </div>
      </div>

      {/* Date Input */}
      <div className="bg-muted/30 p-3 rounded-lg border">
        <Label htmlFor="date" className="text-xs font-bold uppercase text-muted-foreground block mb-1">Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="date" name="date" type="date"
            className="pl-9 bg-white dark:bg-black/20"
            value={date} onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase text-muted-foreground">Exercises</Label>
        </div>

        {exercises.map((ex, index) => (
          <div key={index} className="p-3 border rounded-lg space-y-3 bg-card relative group">
            <Button
              type="button" variant="ghost" size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeExerciseRow(index)}
              disabled={exercises.length <= 1}
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Exercise Name Selector */}
            <div className="grid gap-1.5 w-full pr-6">
              <Label className="text-[10px] text-muted-foreground">Exercise</Label>
              <Popover open={popoverOpen === index} onOpenChange={(isOpen) => setPopoverOpen(isOpen ? index : null)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between text-sm h-9 px-3">
                    <span className="truncate">{ex.name || "Select exercise..."}</span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 z-[1000]" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandEmpty>No exercise found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {searchResults.map((result) => (
                          <CommandItem key={result.id} value={result.name} onSelect={() => handleSelectExercise(index, result)}>
                            <Check className={cn("mr-2 h-3 w-3", ex.id === result.id ? "opacity-100" : "opacity-0")} />
                            {result.name}
                          </CommandItem>
                        ))}
                        {searchQuery.length > 2 && !searchResults.find(r => r.name.toLowerCase() === searchQuery.toLowerCase()) && (
                          <CommandItem onSelect={() => handleCreateCustom(index, searchQuery)} className="text-blue-500 font-medium cursor-pointer">
                            + Create "{searchQuery}"
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Details Row */}
            <div className="flex items-end gap-2">
              {/* Type Selector */}
              <div className="grid gap-1.5 w-[110px]">
                <Label className="text-[10px] text-muted-foreground">Type</Label>
                <Select value={ex.type} onValueChange={(val) => handleExerciseChange(index, 'type', val)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strength">Strength</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ex.type === 'Strength' ? (
                <>
                  <div className="grid gap-1.5 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Sets</Label>
                    <Input className="h-8 text-xs" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Reps</Label>
                    <Input className="h-8 text-xs" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Kg</Label>
                    <Input className="h-8 text-xs" value={ex.weight} onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-1.5 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Min</Label>
                    <Input className="h-8 text-xs" value={ex.duration} onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5 flex-1">
                    <Label className="text-[10px] text-muted-foreground">Km</Label>
                    <Input className="h-8 text-xs" value={ex.distance} onChange={(e) => handleExerciseChange(index, 'distance', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addExerciseRow} className="w-full border-dashed">
          <Plus className="h-3 w-3 mr-1" /> Add Exercise
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className={cn("flex-1", internalMode === 'log' ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (internalMode === "log" ? "Log All" : "Save Plan")}
        </Button>
      </div>
    </div>
  );
}
