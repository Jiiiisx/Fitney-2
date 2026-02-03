"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Pencil, Plus, Droplets, Flame, Utensils, Lightbulb, Sparkles, ChefHat, Search, Loader2, Info } from 'lucide-react';
import AddFoodModal from './AddFoodModal'; // Import Modal
import { calculateDailyAdjustedTargets } from '@/app/lib/nutrition-calculator';
import { useAI } from '@/app/lib/AIContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface RecommendedFood {
  id: number;
  name: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
}

// ... di dalam komponen NutritionResults ...
export default function NutritionResults({ userData, onEdit }: NutritionResultsProps) {
  const { sayActionTip } = useAI();
  // --- State for Nutrition Tracking ---
  const [summary, setSummary] = useState<any>(null);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false); // State untuk Modal
  const [activityType, setActivityType] = useState<'rest' | 'normal' | 'heavy'>('normal');

  // --- State for Recommendations ---
  const [recommendedFoods, setRecommendedFoods] = useState<RecommendedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // --- Fetch Nutrition Data ---
  const refreshData = useCallback(async () => {
    try {
      const [summaryRes, logsRes, waterRes, recFoodsRes, planRes] = await Promise.all([
        fetch("/api/nutrition/summary", { credentials: 'include' }),
        fetch("/api/nutrition/log", { credentials: 'include' }),
        fetch("/api/nutrition/water", { credentials: 'include' }),
        fetch("/api/nutrition/recommendations", { credentials: 'include' }),
        fetch("/api/stats/dashboard", { credentials: 'include' }) // Reuse dashboard API to get today's plan
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (logsRes.ok) setFoodLogs(await logsRes.json());
      if (waterRes.ok) {
        const waterData = await waterRes.json();
        setWaterIntake(waterData.amountMl || 0);
      }
      if (recFoodsRes.ok) setRecommendedFoods(await recFoodsRes.json());
      
      if (planRes.ok) {
        const dashData = await planRes.json();
        if (dashData.todaysPlan?.planName === 'Rest Day') {
            setActivityType('rest');
        } else if (dashData.today?.workouts > 0) {
            setActivityType('heavy');
        } else {
            setActivityType('normal');
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRecipeSearch = useCallback(async (query: string = '') => {
    if (!userData.tdee) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        targetCalories: String(userData.tdee),
        query: query,
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
  }, [userData.tdee]);

  useEffect(() => {
    refreshData();
    // Initial recommendation fetch
    handleRecipeSearch();
  }, [refreshData, handleRecipeSearch]);

  // --- Handlers ---
  const handleAddWater = async (amount: number) => {
    sayActionTip('log_water');
    const newAmount = waterIntake + amount;
    setWaterIntake(newAmount);

    try {
      await fetch("/api/nutrition/water", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amountMl: newAmount })
      });
    } catch (err) {
      console.error("Failed to update water", err);
      setWaterIntake(waterIntake);
    }
  };

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    sayActionTip('search_recipe');
    handleRecipeSearch(searchQuery);
  };

  // Calculations with Dynamic Adjustment
  const adjustedTargets = calculateDailyAdjustedTargets(userData.tdee, activityType);
  const consumedCalories = summary?.consumed?.calories || 0;
  const targetCalories = adjustedTargets.calories;
  const calPercentage = Math.min(100, (consumedCalories / targetCalories) * 100);

  return (
    <div className="space-y-6">

      {/* SECTION 1: COMPACT SUMMARY */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                Daily Nutrition
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Adjusted for your <span className="font-bold text-emerald-600 dark:text-emerald-400">{activityType === 'rest' ? 'Rest Day' : activityType === 'heavy' ? 'Workout Day' : 'Activity'}</span></p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-xs">
                            Fitney automatically adjusts your calorie and macro targets based on whether you are working out or resting today.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline" size="sm" className="h-8 text-xs">
              <Pencil className="w-3 h-3 mr-2" /> Recalculate
            </Button>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm font-medium">
              <span>{consumedCalories} kcal consumed</span>
              <span className="text-muted-foreground font-bold">Today's Target: {targetCalories}</span>
            </div>
            <Progress value={calPercentage} className="h-3 bg-emerald-200 dark:bg-emerald-900" indicatorClassName="bg-emerald-500" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl relative overflow-hidden group">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Protein</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.protein || 0}g <span className="text-[10px] font-normal opacity-50">/ {adjustedTargets.protein}g</span></p>
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, ((summary?.consumed?.protein || 0) / adjustedTargets.protein) * 100)}%` }} />
            </div>
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl relative overflow-hidden">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Carbs</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.carbs || 0}g <span className="text-[10px] font-normal opacity-50">/ {adjustedTargets.carbs}g</span></p>
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, ((summary?.consumed?.carbs || 0) / adjustedTargets.carbs) * 100)}%` }} />
            </div>
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl relative overflow-hidden">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Fat</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary?.consumed?.fat || 0}g <span className="text-[10px] font-normal opacity-50">/ {adjustedTargets.fat}g</span></p>
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, ((summary?.consumed?.fat || 0) / adjustedTargets.fat) * 100)}%` }} />
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
            <Button size="sm" onClick={() => setIsAddFoodOpen(true)}>
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

      {/* SECTION 3: FOOD RECOMMENDATIONS */}
      <Card className="shadow-sm border-none bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Lightbulb className="w-5 h-5" />
            Recommended Healthy Foods
          </CardTitle>
          <CardDescription>Nutritious options to help you reach your goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedFoods.map((food) => (
              <div key={food.id} className="bg-background border rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <h4 className="font-bold text-sm mb-2">{food.name}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">per 100g</p>
                    <p className="text-lg font-bold text-primary">{Math.round(parseFloat(food.caloriesPer100g))} <span className="text-[10px] font-normal text-muted-foreground uppercase">kcal</span></p>
                  </div>
                  <div className="text-[10px] text-right space-y-0.5 text-muted-foreground font-medium">
                    <p>P: {food.proteinPer100g}g</p>
                    <p>C: {food.carbsPer100g}g</p>
                    <p>F: {food.fatPer100g}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: RECIPE FINDER & RECOMMENDATIONS */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            Recipe Recommendations
          </CardTitle>
          <CardDescription>Personalized recipes based on your {userData.tdee} kcal target.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSearchSubmit} className="flex items-center gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Find more recipes (e.g. high protein chicken)..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 h-11 rounded-full border-primary/20 focus-visible:ring-primary" 
              />
            </div>
            <Button type="submit" disabled={isSearching} className="rounded-full h-11 px-8">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </form>

          {/* List Recipes */}
          {isSearching && recipes.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <a 
                  key={recipe.id} 
                  href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative w-full h-40">
                      <Image src={recipe.image} alt={recipe.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          View Recipe <Plus className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h4>
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">
                            {recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount.toFixed(0)} kcal
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Per Serving</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {searchError && (
            <div className="text-center py-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 mb-6">
              <p className="font-bold">Error finding recipes:</p>
              <p className="text-sm">{searchError}</p>
            </div>
          )}

          {recipes.length === 0 && !isSearching && (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground text-sm italic">Enter a keyword to explore specialized recipes.</p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* MODAL COMPONENT */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        onFoodAdded={refreshData}
      />
    </div>
  );
}