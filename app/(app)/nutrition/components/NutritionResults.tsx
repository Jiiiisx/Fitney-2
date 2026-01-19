"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Pencil, Plus, Droplets, Flame, Utensils } from 'lucide-react';

interface UserData {
  tdee: number;
}

interface NutritionResultsProps {
  userData: UserData;
  onEdit: () => void;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  nutrition: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

export default function NutritionResults({ userData, onEdit }: NutritionResultsProps) {
  // --- State for Nutrition Tracking ---
  const [summary, setSummary] = useState<any>(null);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- State for Recipe Finder ---
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // --- Fetch Nutrition Data ---
  const refreshData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, logsRes, waterRes] = await Promise.all([
        fetch("/api/nutrition/summary", { headers }),
        fetch("/api/nutrition/log", { headers }),
        fetch("/api/nutrition/water", { headers })
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (logsRes.ok) setFoodLogs(await logsRes.json());
      if (waterRes.ok) {
        const waterData = await waterRes.json();
        setWaterIntake(waterData.amountMl || 0);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Handlers ---
  const handleAddWater = async (amount: number) => {
    const newAmount = waterIntake + amount;
    // Optimistic Update
    setWaterIntake(newAmount);
    
    try {
        const token = localStorage.getItem("token");
        await fetch("/api/nutrition/water", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ amountMl: newAmount })
        });
    } catch (err) {
        console.error("Failed to update water", err);
        setWaterIntake(waterIntake); // Revert on error
    }
  };

  const handleRecipeSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!userData.tdee) return;

    setIsSearching(true);
    setSearchError(null);
    setRecipes([]);

    try {
      const params = new URLSearchParams({
        targetCalories: String(userData.tdee),
        query: searchQuery,
      });
      const response = await fetch(`/api/recipes/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recipes.');
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFoodClick = () => {
      alert("Fitur 'Add Food Modal' akan segera dibuat! :)");
      // Nanti di sini kita buka Modal
  };

  // Calculations
  const consumedCalories = summary?.consumed?.calories || 0;
  const targetCalories = userData.tdee;
  const calPercentage = Math.min(100, (consumedCalories / targetCalories) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* SECTION 1: COMPACT SUMMARY */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        Daily Nutrition
                    </h2>
                    <p className="text-sm text-muted-foreground">Target based on your TDEE</p>
                </div>
                <Button onClick={onEdit} variant="outline" size="sm" className="h-8 text-xs">
                    <Pencil className="w-3 h-3 mr-2" /> Recalculate
                </Button>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium">
                    <span>{consumedCalories} kcal consumed</span>
                    <span className="text-muted-foreground">Target: {targetCalories}</span>
                </div>
                <Progress value={calPercentage} className="h-3 bg-emerald-200 dark:bg-emerald-900" indicatorClassName="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Protein</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.protein || 0}g</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Carbs</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.carbs || 0}g</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Fat</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.fat || 0}g</p>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* SECTION 2: TRACKING (MEAL & WATER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Meal Log (2/3 width) */}
        <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-muted-foreground" />
                    Today's Meals
                </CardTitle>
                <Button size="sm" onClick={handleAddFoodClick}>
                    <Plus className="w-4 h-4 mr-1" /> Add Food
                </Button>
            </CardHeader>
            <CardContent>
                {foodLogs.length > 0 ? (
                    <div className="space-y-3">
                        {foodLogs.map((log: any) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <div>
                                    <p className="font-medium text-sm">{log.foodName}</p>
                                    <p className="text-xs text-muted-foreground">{log.servingSize}g serving</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{log.totalCalories} kcal</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                        P{log.totalProtein} C{log.totalCarbs} F{log.totalFat}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                        No meals logged today. Start tracking!
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Right: Water Tracker (1/3 width) */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Droplets className="w-5 h-5" />
                    Hydration
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full border-4 border-blue-200 dark:border-blue-800">
                    <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{waterIntake}</span>
                        <p className="text-xs text-muted-foreground">ml</p>
                    </div>
                </div>
                
                <div className="flex justify-center gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-200 hover:bg-blue-100 text-blue-600"
                        onClick={() => handleAddWater(250)}
                    >
                        +250ml
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-200 hover:bg-blue-100 text-blue-600"
                        onClick={() => handleAddWater(500)}
                    >
                        +500ml
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* SECTION 3: RECIPE FINDER (Existing) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recipe Finder</CardTitle>
          <CardDescription>Find healthy recipes that fit your goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecipeSearch} className="flex items-center gap-4 mb-6">
            <Input placeholder="Search recipes (e.g. high protein chicken)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-grow" />
            <Button type="submit" disabled={isSearching}>{isSearching ? '...' : 'Search'}</Button>
          </form>
          
          {/* List Recipes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recipes.map(recipe => (
              <a key={recipe.id} href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`} target="_blank" rel="noopener noreferrer" className="block group">
                <Card className="overflow-hidden h-full hover:shadow-md transition-all border-none bg-muted/30">
                  <div className="relative w-full h-32">
                    <Image src={recipe.image} alt={recipe.title} layout="fill" objectFit="cover" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1">{recipe.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount.toFixed(0)} kcal
                    </p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
          
          {recipes.length === 0 && !isSearching && searchQuery && (
             <p className="text-center text-muted-foreground text-sm py-4">No recipes found.</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}