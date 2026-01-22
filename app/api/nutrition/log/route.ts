import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { foodLogs, foods } from "@/app/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { logFoodSchema } from "@/app/lib/types/api";

//Ambil log makanan hari ini
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const today = new Date();

    const logs = await db
      .select({
        id: foodLogs.id,
        foodName: foods.name,
        calories: foods.caloriesPer100g,
        protein: foods.proteinPer100g,
        carbs: foods.carbsPer100g,
        fat: foods.fatPer100g,
        servingSize: foodLogs.servingSizeG,
        date: foodLogs.date,
      })
      .from(foodLogs)
      .innerJoin(foods, eq(foodLogs.foodId, foods.id))
      .where(
        and(
          eq(foodLogs.userId, userId),
          eq(foodLogs.date, today.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(foodLogs.id));

    const computedLogs = logs.map(log => {
      const ratio = parseFloat(log.servingSize) / 100;
      return {
        ...log,
        totalCalories: Math.round(parseFloat(log.calories || '0') * ratio),
        totalProtein: Math.round(parseFloat(log.protein || '0') * ratio),
        totalCarbs: Math.round(parseFloat(log.carbs || '0') * ratio),
        totalFat: Math.round(parseFloat(log.fat || '0') * ratio),
      }
    });

    return NextResponse.json(computedLogs);
  } catch (error) {
    console.error("GET_FOOD_LOG_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, {status: 500});
  }
}


//Catat makanan baru
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const userId = auth.user.userId;

    const body = await req.json();
    
    // Validate with Zod
    const validation = logFoodSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { foodId, servingSize, date } = validation.data;

    const logDate = date || new Date().toISOString().split('T')[0];

    const newLog = await db.insert(foodLogs).values({
      userId,
      foodId,
      servingSizeG: servingSize.toString(),
      date: logDate
    }).returning();

    return NextResponse.json(newLog[0]);

  } catch (error) {
    console.error("POST_FOOD_LOG_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, {status: 500});
  }
}