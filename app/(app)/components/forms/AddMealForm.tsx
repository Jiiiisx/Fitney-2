"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Utensils,
  ChevronRight,
  Flame,
  CheckCircle2,
  ArrowLeft,
  Loader2
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
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// Tipe data makanan dari API
type Food = {
  id: number;
  name: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
};

export default function AddMealForm({ onCompleted }: { onCompleted?: () => void }) {
  const [step, setStep] = useState<"search" | "details">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servingSize, setServingSize] = useState<string>("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/nutrition/foods/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (Array.isArray(data)) setResults(data);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setStep("details");
  };

  const handleBack = () => {
    setStep("search");
    setSelectedFood(null);
  };

  const handleSubmit = async () => {
    if (!selectedFood || !servingSize) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/nutrition/log", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          foodId: selectedFood.id,
          servingSize: parseFloat(servingSize),
          date: new Date().toISOString().split("T")[0], // Log for today
        }),
      });

      if (!res.ok) throw new Error("Failed to log food");

      toast.success("Meal logged successfully!");
      if (onCompleted) onCompleted();
      // Optional: Trigger global refresh or close modal via props if needed
      // window.location.reload(); // Quick dirty refresh, better to use context/SWR mutation
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate macros for preview
  const calculateMacros = () => {
    if (!selectedFood) return { cal: 0, p: 0, c: 0, f: 0 };
    const ratio = parseFloat(servingSize || "0") / 100;
    return {
      cal: Math.round(parseFloat(selectedFood.caloriesPer100g) * ratio),
      p: Math.round(parseFloat(selectedFood.proteinPer100g) * ratio),
      c: Math.round(parseFloat(selectedFood.carbsPer100g) * ratio),
      f: Math.round(parseFloat(selectedFood.fatPer100g) * ratio),
    };
  };

  const macros = calculateMacros();

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center gap-2 text-xl">
          {step === "details" && (
            <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {step === "search" ? "What did you eat?" : "Meal Details"}
        </DialogTitle>
        <DialogDescription>
          {step === "search"
            ? "Search for food to add to your daily log."
            : `How much ${selectedFood?.name} did you have?`}
        </DialogDescription>
      </DialogHeader>

      {step === "search" ? (
        <Command className="rounded-lg border shadow-sm" shouldFilter={false}>
          <CommandInput
            placeholder="Search food (e.g. Chicken, Rice)..."
            value={query}
            onValueChange={setQuery}
            className="text-base"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="p-4 flex justify-center text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching...
              </div>
            )}
            {!loading && results.length === 0 && query.length > 1 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!loading && query.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            )}
            <CommandGroup heading="Suggestions">
              {results.map((food) => (
                <CommandItem
                  key={food.id}
                  onSelect={() => handleSelectFood(food)}
                  className="cursor-pointer aria-selected:bg-primary/10"
                >
                  <Utensils className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="font-medium">{food.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {Math.round(parseFloat(food.caloriesPer100g))} kcal / 100g
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-muted/50 p-4 rounded-xl border border-border flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">{selectedFood?.name}</h4>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center"><Flame className="w-3 h-3 mr-1 text-orange-500" /> {macros.cal} kcal</span>
                <span>P: {macros.p}g</span>
                <span>C: {macros.c}g</span>
                <span>F: {macros.f}g</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{macros.cal}</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Calories</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <Label htmlFor="serving">Serving Size (grams)</Label>
            <div className="relative">
              <Input
                id="serving"
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="pl-4 pr-12 text-lg h-12"
                autoFocus
              />
              <span className="absolute right-4 top-3 text-muted-foreground text-sm font-medium">g</span>
            </div>

            {/* Quick Portions (Optional UX enhancement) */}
            <div className="flex gap-2">
              {[50, 100, 200, 300].map(amt => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => setServingSize(amt.toString())}
                >
                  {amt}g
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-11 text-base font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting || !servingSize}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" /> Log Meal
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}