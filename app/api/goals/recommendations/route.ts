import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { userProfiles } from '@/app/lib/schema';
import { verifyAuth } from "@/app/lib/auth";
import { eq } from "drizzle-orm";
import Recommendations from "@/app/(app)/planner/components/Recommendations";

type UserProfile = {
  mainGoal: string | null;
  experienceLevel: string | null;
  workoutLocation: string | null;
};

type GoalTemplate = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

function generateRecommendations(profile: UserProfile):GoalTemplate[] {
  const recommendations: GoalTemplate[] = [];
  if (profile.mainGoal === 'lose_weight') {
    if (profile.experienceLevel === 'beginner') {
      recommendations.push(
        { title: "3 Workout This Week", category: 'weekly', metric: 'workout_frequency', target_value: 3, description: "Complete an three distinct workouts to build a consistent habit." },
        { title: "Burn 1200 Calories", category: 'weekly', metric: 'calories_burned', target_value: 1200, description: "Focus on raising your heart rate. A 30-minutes run burns about 300 kcal," },
        { title: "Run a Total of 5km", category: 'long_term', metric: 'distance_run', target_value: 5, description: "Your first major running milestone. Can be split accros multiple sessions."},
      );
    } else {
      recommendations.push(
        { title: "4 Workout this week", category: 'weekly', metric: 'workout_frequency', target_value: 4, description: "Increse intensity or duration to challange your body."},
        { title: "Burn 2000 Calories", category: 'weekly', metric: 'calories_burned', target_value: 2000, description: "Incorporate high-intesity interval training (HIIT) to maximize calorie burn."},
        { title: "Run a Total of 10km", category: 'long_term', metric: 'calories_burned', target_value: 10, description: "build endurance towards a 10k. Consistency is key" },
      );
    }
  }

  if (profile.mainGoal === 'gain_muscle') {
    if (profile.experienceLevel === 'beginner') {
      recommendations.push(
        { title: "3 Strenght Workout", category: 'weekly', metric: 'workout_frequency', target_value: 3, description: "Focus on compound lifts like squats, deadlifts, and bench presses." },
        { title: "Lift 2,000kg Total Volume", category: 'long_term', metric: 'weight_lifted', target_value: 2000, description: "Track the total weigth (sets x reps x weight) you lift in your sessions" },
      );
    } else {
      recommendations.push(
        { title: "4 Strenght Workouts", category: 'weekly', metric: 'workout_frequency', target_value: 4, description: "Split your training to focus on different muscle groups each day." },
        { title: "Lift 5,000kg Total Volume", category: 'long_term', metric: 'weight_lifted', target_value: 5000, description: "Progressive is key. Increase the total volume lifted each week" },
      );
    }
  }

  if (profile.mainGoal === 'improve_endurance') {
    recommendations.push(
      { title: "90 Avtive Minutes This Week", category: 'weekly', metric: 'active_minutes', target_value: 90, description: "Flexibility and recovery are crucial for building endurance." },
    );
  }

  return recommendations;
}

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error || !auth.user) {
    return auth.error || NextResponse.json({ error: 'Unauthorized'}, { status: 401 });
  }
  const userId = auth.user.userId;

  try {
    const profileResult = await db
      .select({
        mainGoal: userProfiles.mainGoal,
        experienceLevel: userProfiles.experienceLevel,
        workoutLocation: userProfiles.workoutLocation,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (profileResult.length === 0) {
      return NextResponse.json({ Recommendations: [] });
    }

    const userProfile: UserProfile = profileResult[0];

    const recommendations = generateRecommendations(userProfile);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('API_RECOMMENDATIONS_ERROR', error);
    return NextResponse.json({ error: 'Internal server error'}, {status: 500});
  }
}