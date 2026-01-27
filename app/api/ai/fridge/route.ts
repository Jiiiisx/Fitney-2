import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { safeGenerateContent, extractJSON } from "@/app/lib/gemini"; // Use centralized helper
import { db } from "@/app/lib/db";
import { userProfiles, userGoals } from "@/app/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const { ingredients } = await req.json();
    if (!ingredients || ingredients.length === 0) {
        return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    // 1. Get User Context (Dietary Goal)
    const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId)
    });
    
    const userGoal = profile?.mainGoal || "General Health";

    const prompt = `
      You are a Michelin-star Chef specialized in Fitness Nutrition.
      User Goal: ${userGoal}.
      Available Ingredients: ${ingredients.join(", ")}.

      Task: Create 2 distinct, delicious recipes using MAINLY these ingredients (you can assume user has basics like oil, salt, pepper, spices, water).

      Format: STRICT JSON Array. Do not include markdown code blocks.
      
      [
        {
          "title": "Creative Recipe Name",
          "description": "1 sentence marketing description enticing the user.",
          "calories": number (integer),
          "protein": "amount in grams (e.g. 30g)",
          "carbs": "amount in grams",
          "fats": "amount in grams",
          "time": "e.g. 15 mins",
          "difficulty": "Easy" | "Medium" | "Hard",
          "ingredients": ["List of ingredients with quantities"],
          "instructions": ["Step 1...", "Step 2..."]
        }
      ]
    `;

    const text = await safeGenerateContent(prompt);
    const recipes = extractJSON(text);

    if (!recipes) {
        throw new Error("Failed to parse AI response");
    }
    
    return NextResponse.json(recipes);

  } catch (error) {
    console.error("AI_FRIDGE_ERROR", error);
    // Return mock data on error to prevent UI crash
    return NextResponse.json([
        {
            title: "Quick Protein Stir-Fry (Offline Mode)",
            description: "AI is currently offline, but here is a safe bet!",
            calories: 400,
            protein: "35g",
            time: "10 mins",
            ingredients: ingredients || ["Protein source", "Veggies"],
            instructions: ["Sauté protein", "Add veggies", "Season and serve"]
        }
    ]);
  }
}
