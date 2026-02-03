// app/api/recipes/search/route.ts
import { verifyAuth } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    console.error('Spoonacular API key is missing.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const targetCalories = searchParams.get('targetCalories');
  const query = searchParams.get('query');

  if (!targetCalories) {
    return NextResponse.json(
      { error: 'Target calories are required.' },
      { status: 400 }
    );
  }

  // Calculate per-meal calories (assuming 3 meals a day)
  const mealCalories = Math.round(parseInt(targetCalories, 10) / 3);

  // Construct the Spoonacular API URL
  const spoonacularUrl = new URL('https://api.spoonacular.com/recipes/complexSearch');
  spoonacularUrl.searchParams.append('apiKey', apiKey);
  spoonacularUrl.searchParams.append('maxCalories', String(mealCalories)); // Use per-meal calories
  spoonacularUrl.searchParams.append('number', '12'); // Fetch 12 recipes
  spoonacularUrl.searchParams.append('addRecipeNutrition', 'true'); // CRITICAL: This was missing!
  spoonacularUrl.searchParams.append('fillIngredients', 'true');
  
  if (query) {
    spoonacularUrl.searchParams.append('query', query);
  }

  try {
    const response = await fetch(spoonacularUrl.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spoonacular API Error:', errorData);
      return NextResponse.json(
        { error: `Failed to fetch recipes: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.results);

  } catch (error) {
    console.error('Error fetching from Spoonacular:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while fetching recipes.' },
      { status: 500 }
    );
  }
}
