"use client";

import { useState, FormEvent, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Dumbbell,
  Plus,
  X,
  Heart,
  ChevronsUpDown,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from '@/lib/utils';

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

interface AddWorkoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanChange: () => void;
}

type ExerciseInput = {
  id: number | null;
  name: string;
  type: 'Strength' | 'Cardio';
  sets: string;
  reps: string;
  duration: string;
};

type ApiExercise = {
  id: number;
  name: string;
};

export function AddWorkoutForm({ open, onOpenChange, onPlanChange }: AddWorkoutFormProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState<ExerciseInput[]>([{ id: null, name: '', type: 'Strength', sets: '', reps: '', duration: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiExercise[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchExercises = useCallback(async (query: string, pageNum: number) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/exercises/search?q=${query}&page=${pageNum}`);
      const data: { results: ApiExercise[], hasMore: boolean } = await response.json();
      
      setSearchResults(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to search exercises", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    setSearchResults([]);
    setPage(1);
    setHasMore(true);
    if (debouncedSearchQuery) {
      fetchExercises(debouncedSearchQuery, 1);
    }
  }, [debouncedSearchQuery, fetchExercises]);

  const loadMore = () => {
    if (hasMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExercises(debouncedSearchQuery, nextPage);
    }
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseInput, value: any) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const addExerciseRow = () => {
    setExercises([...exercises, { id: null, name: '', type: 'Strength', sets: '', reps: '', duration: '' }]);
  };

  const removeExerciseRow = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workoutName || !date || exercises.some(ex => !ex.id)) {
      setError('Please fill out workout name, date, and select all exercises from the list.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch('/api/planner/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: workoutName,
          date,
          exercises: exercises.filter(ex => ex.id),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add workout.');
      }

      onPlanChange();
      onOpenChange(false);
      setWorkoutName('');
      setDate('');
      setExercises([{ id: null, name: '', type: 'Strength', sets: '', reps: '', duration: '' }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setPopoverOpen(null); onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader><DialogTitle>Plan a New Workout</DialogTitle><DialogDescription>Build your custom workout session.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="workout-name">Workout Name</Label><Input id="workout-name" placeholder="e.g., Leg Day" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} /></div>
              <div><Label htmlFor="workout-date">Date</Label><Input id="workout-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            </div>
            <hr/>
            <div className="grid gap-4">
              <Label>Exercises</Label>
              {exercises.map((ex, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="grid gap-1.5 flex-grow">
                      <Label className="text-xs">Exercise Name</Label>
                      <Popover open={popoverOpen === index} onOpenChange={(isOpen) => setPopoverOpen(isOpen ? index : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                            {ex.id ? ex.name : "Select exercise..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search exercise..." onValueChange={setSearchQuery} />
                            <CommandEmpty>{isSearching ? 'Searching...' : 'No exercise found.'}</CommandEmpty>
                            <CommandGroup className="h-[200px] overflow-y-auto" onScroll={(e) => {
                              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                              if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isSearching) {
                                loadMore();
                              }
                            }}>
                              {searchResults.map((result) => (
                                <CommandItem
                                  key={result.id}
                                  value={result.name}
                                  onSelect={() => {
                                    handleExerciseChange(index, 'id', result.id);
                                    handleExerciseChange(index, 'name', result.name);
                                    setPopoverOpen(null);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", ex.id === result.id ? "opacity-100" : "opacity-0")} />
                                  {result.name}
                                </CommandItem>
                              ))}
                              {isSearching && page > 1 && <div className="flex justify-center items-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExerciseRow(index)} disabled={exercises.length <= 1}><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-end gap-2 pl-2">
                    <div className="grid gap-1.5 w-40"><Label className="text-xs">Type</Label>
                      <Select value={ex.type} onValueChange={(value) => handleExerciseChange(index, 'type', value as 'Strength' | 'Cardio')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strength"><div className="flex items-center gap-2"><Dumbbell className="h-4 w-4" /><span>Strength</span></div></SelectItem>
                          <SelectItem value="Cardio"><div className="flex items-center gap-2"><Heart className="h-4 w-4" /><span>Cardio</span></div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {ex.type === 'Strength' && (<>
                      <div className="grid gap-1.5 w-24"><Label className="text-xs">Sets</Label><Input placeholder="3" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} /></div>
                      <div className="grid gap-1.5 w-28"><Label className="text-xs">Reps</Label><Input placeholder="8-12" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} /></div>
                    </>)}
                    {ex.type === 'Cardio' && (
                      <div className="grid gap-1.5 w-32"><Label className="text-xs">Duration (min)</Label><Input type="number" placeholder="30" value={ex.duration} onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)} /></div>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExerciseRow} className="mt-2"><Plus className="h-4 w-4 mr-2" />Add Exercise</Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter className="mt-6"><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Adding...' : 'Add to Plan'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}