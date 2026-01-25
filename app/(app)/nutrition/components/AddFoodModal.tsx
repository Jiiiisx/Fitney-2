"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Plus } from "lucide-react";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: () => void;
}

export default function AddFoodModal({ isOpen, onClose, onFoodAdded }: AddFoodModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [servingSize, setServingSize] = useState("100"); // Default 100g
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/foods/search?q=${query}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Failed to search food", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFood || !servingSize) return;

    setSubmitting(true);
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
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        onFoodAdded();
        handleClose();
      }
    } catch (error) {
      console.error("Failed to add food log", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSelectedFood(null);
    setServingSize("100");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
        </DialogHeader>

        {!selectedFood ? (
          // STEP 1: SEARCH
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food (e.g. Rice, Chicken)..."
                className="pl-9 h-12 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>}

              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="text-center p-4 text-sm text-muted-foreground">No food found.</div>
              )}

              {results.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted cursor-pointer transition-colors active:bg-muted/80"
                  onClick={() => setSelectedFood(food)}
                >
                  <div>
                    <p className="font-medium text-base">{food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {food.caloriesPer100g} kcal / 100g
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // STEP 2: INPUT DETAILS
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg mb-4">
              <p className="font-bold">{selectedFood.name}</p>
              <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                <span>Cal: {selectedFood.caloriesPer100g}</span>
                <span>P: {selectedFood.proteinPer100g}</span>
                <span>C: {selectedFood.carbsPer100g}</span>
                <span>F: {selectedFood.fatPer100g}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serving Size (grams)</Label>
              <Input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedFood(null)} disabled={submitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Log
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
