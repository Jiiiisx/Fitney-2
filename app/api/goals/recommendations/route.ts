// app/api/goals/recommendations/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

type UserProfile = {
  main_goal: string;
  experience_level: string;
  workout_location: string;
};

type GoalTemplate = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

/**
 * The "engine" that generates goal recommendations based on user profile.
 */
function generateRecommendations(profile: UserProfile): GoalTemplate[] {
  const recommendations: GoalTemplate[] = [];

  // --- Recommendations for GOAL: lose_weight ---
  if (profile.main_goal === 'lose_weight') {
    if (profile.experience_level === 'beginner') {
      recommendations.push(
        { title: "3 Workouts This Week", category: 'weekly', metric: 'workout_frequency', target_value: 3, description: "Complete any three distinct workouts to build a consistent habit." },
        { title: "Burn 1200 Calories", category: 'weekly', metric: 'calories_burned', target_value: 1200, description: "Focus on raising your heart rate. A 30-minute run burns about 300 kcal." },
        { title: "Run a Total of 5km", category: 'long_term', metric: 'distance_run', target_value: 5, description: "Your first major running milestone. Can be split across multiple sessions." },
      );
    } else { // intermediate & advanced
      recommendations.push(
        { title: "4 Workouts This Week", category: 'weekly', metric: 'workout_frequency', target_value: 4, description: "Increase intensity or duration to challenge your body." },
        { title: "Burn 2000 Calories", category: 'weekly', metric: 'calories_burned', target_value: 2000, description: "Incorporate high-intensity interval training (HIIT) to maximize calorie burn." },
        { title: "Run a Total of 10km", category: 'long_term', metric: 'distance_run', target_value: 10, description: "Build endurance towards a 10k. Consistency is key." },
      );
    }
  }

  // --- Recommendations for GOAL: gain_muscle ---
  if (profile.main_goal === 'gain_muscle') {
    if (profile.experience_level === 'beginner') {
      recommendations.push(
        { title: "3 Strength Workouts", category: 'weekly', metric: 'workout_frequency', target_value: 3, description: "Focus on compound lifts like squats, deadlifts, and bench presses." },
        { title: "Lift 2,000kg Total Volume", category: 'long_term', metric: 'weight_lifted', target_value: 2000, description: "Track the total weight (sets x reps x weight) you lift in your sessions." },
      );
    } else { // intermediate & advanced
      recommendations.push(
        { title: "4 Strength Workouts", category: 'weekly', metric: 'workout_frequency', target_value: 4, description: "Split your training to focus on different muscle groups each day." },
        { title: "Lift 5,000kg Total Volume", category: 'long_term', metric: 'weight_lifted', target_value: 5000, description: "Progressive overload is key. Increase the total volume lifted each week." },
      );
    }
  }
  
  // --- Recommendations for GOAL: improve_endurance ---
  if (profile.main_goal === 'improve_endurance') {
    recommendations.push(
      { title: "90 Active Minutes This Week", category: 'weekly', metric: 'active_minutes', target_value: 90, description: "Perform at least 3 sessions of 30+ minutes of sustained cardio." },
      { title: "Complete 2 Yoga/Flexibility Sessions", category: 'long_term', metric: 'yoga_sessions', target_value: 2, description: "Flexibility and recovery are crucial for building endurance." },
    );
  }

  return recommendations;
}


export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    // 1. Fetch user's profile
    const profileResult = await query('SELECT main_goal, experience_level, workout_location FROM user_profiles WHERE user_id = $1', [userId]);

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const userProfile: UserProfile = profileResult.rows[0];

    // 2. Generate recommendations based on the profile
    const recommendations = generateRecommendations(userProfile);
    
    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error('API_RECOMMENDATIONS_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
