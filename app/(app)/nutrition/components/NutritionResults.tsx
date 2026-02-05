"use client";

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Pencil, Plus, Droplets, Flame, Utensils, Lightbulb, Sparkles, ChefHat, Search, Loader2, Info, Zap, Target, TrendingUp } from 'lucide-react';
import AddFoodModal from './AddFoodModal'; // Import Modal
import { calculateDailyAdjustedTargets } from '@/app/lib/nutrition-calculator';
import { useAI } from '@/app/lib/AIContext';
import CircularProgress from '@/app/(app)/components/CircularProgress';
import { cn } from '@/app/lib/utils';
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

const MacroRing = ({ label, consumed, target, color, icon: Icon }: { 
  label: string, 
  consumed: number, 
  target: number, 
  color: string,
  icon: any
}) => {
  const percentage = Math.min(100, (consumed / (target || 1)) * 100);
  
  // Map color to bg and text classes
  const colorMap: Record<string, { bg: string, text: string, ring: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'text-emerald-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'text-blue-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'text-orange-500' },
  };

  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative mb-3 group">
        <CircularProgress 
          percentage={percentage} 
          size={56} 
          strokeWidth={6} 
          color={theme.ring}
        >
          <div className={cn("p-2 rounded-full", theme.bg)}>
            <Icon className={cn("w-4 h-4", theme.text)} />
          </div>
        </CircularProgress>
        {percentage >= 100 && (
          <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-neutral-900">
            <Zap className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <p className="text-base font-black tracking-tight">{Math.round(consumed)}</p>
        <p className="text-[10px] text-muted-foreground font-bold">/{target}g</p>
      </div>
    </div>
  );
};

// ... di dalam komponen NutritionResults ...
export default function NutritionResults({ userData, onEdit }: NutritionResultsProps) {
  const { sayActionTip } = useAI();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
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
  const adjustedTargets = calculateDailyAdjustedTargets(userData.tdee || 2000, activityType);
  const consumedCalories = summary?.consumed?.calories || 0;
  
  // Prioritaskan target dari API Summary jika tersedia
  const targetCalories = summary?.targets?.calories || adjustedTargets.calories;
  const targetProtein = summary?.targets?.protein || adjustedTargets.protein;
  const targetCarbs = summary?.targets?.carbs || adjustedTargets.carbs;
  const targetFat = summary?.targets?.fat || adjustedTargets.fat;

  const calPercentage = Math.min(100, (consumedCalories / targetCalories) * 100);

  return (
    <div className="space-y-6">

      {/* SECTION 1: PREMIUM SUMMARY */}
      <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-neutral-950 relative group">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full -ml-48 -mb-48 blur-3xl pointer-events-none group-hover:bg-teal-500/10 transition-colors duration-700" />
        
        <CardContent className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-3 tracking-tight">
                Daily Nutrition
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {activityType === 'rest' ? 'Rest Day' : activityType === 'heavy' ? 'Workout Day' : 'Active Day'}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-[10px] p-2">
                      Fitney automatically adjusts your calorie and macro targets based on your daily activity and workout plans.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Button 
              onClick={onEdit} 
              variant="outline" 
              size="sm" 
              className="rounded-full h-10 px-5 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-bold text-xs transition-all active:scale-95 shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Recalculate
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center">
             {/* Left Column: Circular Progress */}
             <div className="relative flex-shrink-0 animate-in fade-in zoom-in duration-700">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl opacity-20 scale-90" />
                <CircularProgress 
                  percentage={calPercentage} 
                  size={!mounted ? 180 : (window.innerWidth < 640 ? 160 : 220)} 
                  strokeWidth={!mounted ? 12 : (window.innerWidth < 640 ? 12 : 16)} 
                  color="text-emerald-500"
                >
                   <div className="text-center">
                     <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-1">Remaining</p>
                     <div className="flex flex-col items-center">
                        <p className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white leading-none tracking-tighter">
                          {Math.max(0, targetCalories - Math.round(consumedCalories))}
                        </p>
                        <p className="text-[8px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-2 tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded-full">kcal</p>
                     </div>
                   </div>
                </CircularProgress>
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-2.5 border border-emerald-100 dark:border-emerald-900 animate-bounce transition-transform hover:scale-110">
                   <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 fill-orange-500" />
                </div>
             </div>

             {/* Right Column: Detailed Stats */}
             <div className="flex-grow w-full space-y-8">
                <div className="grid grid-cols-1 gap-5">
                   <div className="flex justify-between items-end px-1">
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Consumed</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">{Math.round(consumedCalories)}</p>
                          <p className="text-sm font-bold text-muted-foreground italic">kcal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60 text-right">Target</p>
                        <div className="flex items-baseline justify-end gap-1">
                          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter opacity-40">{targetCalories}</p>
                          <p className="text-sm font-bold text-muted-foreground italic opacity-40">kcal</p>
                        </div>
                      </div>
                   </div>
                   <div className="relative pt-2">
                     <Progress 
                      value={calPercentage} 
                      className="h-4 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200/20 dark:border-neutral-800/20" 
                      indicatorClassName="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                     />
                     {calPercentage > 0 && (
                       <div 
                        className="absolute top-[18px] h-4 w-1 bg-white/40 blur-[1px] rounded-full transition-all duration-1000" 
                        style={{ left: `${Math.min(98, calPercentage)}%` }}
                       />
                     )}
                   </div>
                </div>

                {/* Macro Grid with our new component */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                   <MacroRing 
                    label="Protein" 
                    consumed={summary?.consumed?.protein || 0} 
                    target={targetProtein} 
                    color="emerald" 
                    icon={Zap}
                   />
                   <MacroRing 
                    label="Carbs" 
                    consumed={summary?.consumed?.carbs || 0} 
                    target={targetCarbs} 
                    color="blue" 
                    icon={Target}
                   />
                   <MacroRing 
                    label="Fat" 
                    consumed={summary?.consumed?.fat || 0} 
                    target={targetFat} 
                    color="orange" 
                    icon={Flame}
                   />
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: TRACKING (MEAL & WATER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Meal Log (2/3 width) */}
        <Card className="md:col-span-2 shadow-sm border-none bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-50 dark:border-neutral-800">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600">
                <Utensils className="w-5 h-5" />
              </div>
              Today's Meals
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setIsAddFoodOpen(true)}
              className="rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Food
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {foodLogs.length > 0 ? (
              <div className="space-y-4">
                {foodLogs.map((log: any) => (
                  <div key={log.id} className="group flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center shadow-sm text-lg">
                        {log.foodName.toLowerCase().includes('chicken') ? '🍗' : 
                         log.foodName.toLowerCase().includes('egg') ? '🥚' :
                         log.foodName.toLowerCase().includes('milk') ? '🥛' :
                         log.foodName.toLowerCase().includes('rice') ? '🍚' : '🍲'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-900 dark:text-white">{log.foodName}</p>
                        <p className="text-xs text-muted-foreground font-medium">{log.servingSize}g serving</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">{log.totalCalories} <span className="text-[10px] opacity-70">kcal</span></p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 uppercase">P {log.totalProtein}g</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 uppercase">C {log.totalCarbs}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-neutral-50 dark:bg-neutral-800">
                  <Utensils className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-medium italic opacity-60">No meals logged today. Start tracking!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Water Tracker (1/3 width) */}
        <Card className="shadow-sm border-none bg-blue-500 text-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Droplets className="w-32 h-32" />
          </div>
          
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/20">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              Hydration
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-8 relative pt-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center relative overflow-hidden">
                {/* Wave effect logic simplified for UI */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/30 transition-all duration-1000" style={{ height: `${Math.min(100, (waterIntake / 3000) * 100)}%` }} />
                <div className="relative z-10 text-center">
                  <span className="text-4xl font-black">{waterIntake}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">ml</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-4">
              <Button
                variant="secondary"
                className="w-full rounded-2xl font-bold text-blue-600 hover:bg-white transition-colors h-12"
                onClick={() => handleAddWater(250)}
              >
                +250ml <span className="ml-2 text-[10px] opacity-60 font-normal">(Glass)</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full rounded-2xl font-bold text-blue-600 bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors h-12"
                onClick={() => handleAddWater(500)}
              >
                +500ml <span className="ml-2 text-[10px] opacity-60 font-normal">(Bottle)</span>
              </Button>
            </div>
            
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Goal: 3000ml / day</p>
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
              {recipes.map((recipe, index) => (
                <a 
                  key={recipe.id} 
                  href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative w-full h-40">
                      <Image 
                        src={recipe.image} 
                        alt={recipe.title} 
                        layout="fill" 
                        objectFit="cover" 
                        className="group-hover:scale-105 transition-transform duration-500"
                        priority={index < 4}
                      />
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