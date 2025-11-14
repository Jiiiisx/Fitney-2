"use client";

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Pencil } from 'lucide-react';

interface UserData {
  tdee: number;
  // We can pass the rest of the data if needed for display
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
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      {/* Result and Edit Section - Redesigned as a full-width banner */}
      <div className="relative w-full bg-green-100/50 border border-green-200/80 rounded-2xl p-8 text-center">
        <Button onClick={onEdit} variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <Pencil className="w-5 h-5" />
        </Button>
        <p className="text-lg text-green-800">Your Estimated Daily Calorie Needs</p>
        <p className="text-7xl font-bold text-green-700 my-2">{userData.tdee}</p>
        <p className="text-lg text-green-800">calories/day</p>
        <p className="text-sm text-gray-600 mt-4">
          Use this as a starting point. You can edit your data anytime.
        </p>
      </div>

      {/* Recipe Finder Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Finder</CardTitle>
          <CardDescription>Find recipes that fit your daily calorie target (approx. {Math.round(userData.tdee / 3)} calories per meal).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecipeSearch} className="flex items-center gap-4 mb-6">
            <Input placeholder="e.g., chicken, vegan, high protein..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-grow" />
            <Button type="submit" disabled={isSearching}>{isSearching ? 'Searching...' : 'Find Recipes'}</Button>
          </form>
          
          {isSearching && <p className="text-center text-muted-foreground">Searching for recipes...</p>}
          {searchError && <p className="text-center text-red-500">{searchError}</p>}
          {!isSearching && !searchError && recipes.length === 0 && (
            <p className="text-center text-muted-foreground">No recipes found. Try a different search term.</p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {recipes.map(recipe => (
              <a key={recipe.id} href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`} target="_blank" rel="noopener noreferrer" className="block group">
                <Card className="overflow-hidden h-full transition-all group-hover:shadow-lg">
                  <div className="relative w-full h-40">
                    <Image src={recipe.image} alt={recipe.title} layout="fill" objectFit="cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{recipe.title}</CardTitle>
                    <CardDescription>
                      {recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount.toFixed(0)} calories
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
