import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { foodLogs, foods } from "@/app/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try{
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const TARGETS = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70
    };

    const today = new Date().toISOString().split('T')[0];

    const logs = await db
      .select({
        calories: foods.caloriesPer100g,
        protein: foods.proteinPer100g,
        carbs: foods.carbsPer100g,
        fat: foods.fatPer100g,
        servingSize: foodLogs.servingSizeG,
      })
      .from(foodLogs)
      .innerJoin(foods, eq(foodLogs.foodId, foods.id))
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.date, today)
        )
      );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    logs.forEach(log => {
      const ratio = parseFloat(log.servingSize) / 100;
      totalCalories += parseFloat(log.calories || '0') * ratio;
      totalProtein += parseFloat(log.protein || '0') * ratio;
      totalCarbs += parseFloat(log.carbs || '0') * ratio;
      totalFat += parseFloat(log.fat || '0') * ratio;
    });

    return NextResponse.json({
      consumed: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat)
      },
      targets: TARGETS
    });

  } catch (error) {
    console.error("GET_NUTRITION_SUMMARY_ERROR", error);
    return NextResponse.json ({ error: "Internal Server Error" }, { status: 500 });
  }
}