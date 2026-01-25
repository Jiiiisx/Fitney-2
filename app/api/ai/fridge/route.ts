import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { model } from "@/app/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    const { ingredients } = await req.json();
    if (!ingredients || ingredients.length === 0) {
        return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    const prompt = `
      As a fitness nutrition expert, suggest 2 healthy, macro-friendly recipes using these ingredients: ${ingredients.join(", ")}.
      
      Return ONLY a JSON array in this exact format:
      [
        {
          "title": "Recipe Name",
          "calories": number,
          "protein": "amount with unit",
          "time": "estimated time",
          "instructions": "short step-by-step"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (Gemini might wrap it in markdown code blocks)
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const recipes = JSON.parse(jsonMatch[0]);
    return NextResponse.json(recipes);

  } catch (error) {
    console.error("AI_FRIDGE_ERROR", error);
    return NextResponse.json({ error: "Failed to process ingredients" }, { status: 500 });
  }
}