import { z } from 'zod';

// Zod Schema untuk validasi input Nutrition Log
export const logFoodSchema = z.object({
  foodId: z.number().int().positive(),
  servingSize: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

export type LogFoodRequest = z.infer<typeof logFoodSchema>;

// Tipe Response untuk Dashboard
export interface DashboardData {
  today: {
    duration: number;
    calories: number;
    workouts: number;
    water: number;
    steps: number;
  };
  todaysPlan: {
    planName: string | null;
    description: string | null;
    programName: number | null;
  } | null;
  weekly: { name: string; value: number }[];
  recent: any[]; // Bisa diperjelas dengan tipe WorkoutLog jika ada
  streak: number;
  insight: string;
  breakdown: {
    mostFrequent: string;
    avgDuration: number;
    heatmap: { date: string; count: number }[];
  };
}
