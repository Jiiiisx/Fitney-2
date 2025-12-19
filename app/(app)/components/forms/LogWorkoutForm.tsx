"use client";

import { useState, useEffect } from "react";
import { Search, Dumbbell, Clock, Calendar as CalendarIcon, Check, ChevronLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface Exercise {
  id: number;
  name: string;
  category: string;
}

interface LogWorkoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LogWorkoutForm({ onSuccess, onCancel }: LogWorkoutFormProps) {
  // --- STATE ---
  const [step, setStep] = useState<"search" | "details">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    sets: "3",
    reps: "10",
    weight: "0",
    duration: "0",
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

    // Debounce search (wait 300ms after typing stops)
    const timeoutId = setTimeout(() => {
      searchExercises();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setStep("details");
    setSearchQuery(""); // Reset search for next time
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const payload = {
        exerciseId: selectedExercise?.id,
        name: selectedExercise?.name, // Backup name
        type: "Strength", // Todo: Detect from category
        sets: Number(formData.sets),
        reps: formData.reps,
        weight: Number(formData.weight),
        duration: Number(formData.duration),
        date: formData.date
      };

      const res = await fetch("/api/workouts/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to log workout");
      }

      // Success!
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Workout Logged!</span>
          <span className="text-sm flex items-center gap-1">
            <Flame size={14} className="text-orange-500" /> 
            You gained {data.xpGained} XP!
          </span>
        </div>
      );

      if (data.leveledUp) {
        toast("LEVEL UP! 🎉", { icon: "⭐" });
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
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search exercises (e.g. Push Up, Bench Press)..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {searchResults.length === 0 && searchQuery.length > 1 && (
             <p className="text-center text-sm text-muted-foreground py-4">No exercises found.</p>
          )}

          {searchResults.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(ex)}
              className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors border flex items-center justify-between group"
            >
              <div>
                <p className="font-medium text-foreground">{ex.name}</p>
                <p className="text-xs text-muted-foreground">{ex.category || "General"}</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          {/* Fallback Manual Entry (Optional) */}
          {searchQuery.length > 2 && (
             <button 
                onClick={() => handleSelectExercise({ id: 0, name: searchQuery, category: "Custom" })}
                className="w-full text-left p-3 text-sm text-blue-500 hover:underline"
             >
                Can't find it? Add "{searchQuery}" manually
             </button>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 2 (DETAILS) ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setStep("search")}
            className="h-8 w-8"
        >
            <ChevronLeft size={18} />
        </Button>
        <div>
            <h3 className="font-semibold text-lg leading-tight">{selectedExercise?.name}</h3>
            <p className="text-xs text-muted-foreground">Enter details</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="sets">Sets</Label>
            <div className="relative">
                <Dumbbell className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="sets" name="sets" type="number" 
                    className="pl-9" 
                    value={formData.sets} onChange={handleInputChange} 
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input 
                id="reps" name="reps" placeholder="e.g. 10 or 8-12"
                value={formData.reps} onChange={handleInputChange} 
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
                id="weight" name="weight" type="number" step="0.5"
                value={formData.weight} onChange={handleInputChange} 
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="duration">Duration (mins)</Label>
            <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="duration" name="duration" type="number" 
                    className="pl-9" 
                    value={formData.duration} onChange={handleInputChange} 
                />
            </div>
        </div>
      </div>

      <div className="space-y-2">
         <Label htmlFor="date">Date</Label>
         <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                id="date" name="date" type="date"
                className="pl-9"
                value={formData.date} onChange={handleInputChange}
            />
         </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Saving..." : "Log Workout"}
        </Button>
      </div>
    </form>
  );
}
