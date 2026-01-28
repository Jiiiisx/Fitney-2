import { db } from "./db";
import { userGoals, users } from "./schema";
import { eq, sql } from "drizzle-orm";

export interface GoalProgressResult {
    percentage: number;
    status: 'failed' | 'on_track' | 'near_completion' | 'completed';
    xpAwarded: number;
    message: string;
}

export function evaluateGoalProgress(current: number, target: number): GoalProgressResult {
    const percentage = (current / target) * 100;
    
    if (percentage >= 100) {
        return {
            percentage: 100,
            status: 'completed',
            xpAwarded: 100,
            message: "Goal Smashed! You're unstoppable. 🔥"
        };
    } else if (percentage >= 85) {
        return {
            percentage,
            status: 'near_completion',
            xpAwarded: 50,
            message: "So close! You gave it a great effort. Here's some partial XP! 👏"
        };
    } else if (percentage >= 50) {
        return {
            percentage,
            status: 'on_track',
            xpAwarded: 20,
            message: "Halfway there! Keep pushing, every bit counts."
        };
    }
    
    return {
        percentage,
        status: 'failed',
        xpAwarded: 0,
        message: "Every day is a new chance. Let's try to get more active tomorrow!"
    };
}

/**
 * Checks if a goal has been consistently underachieved 
 * and suggests an easier target to keep the user motivated.
 */
export async function getAdaptiveSuggestion(userId: string, goalId: number) {
    // Logic: In a real app, we'd check history. 
    // If last 3 periods were < 50%, suggest target * 0.8
    return {
        shouldSuggest: true,
        reason: "consistent_underachievement",
        suggestedNewTarget: "20% lower than current",
        message: "We noticed this goal has been tough lately. Would you like to adjust it to something more achievable to keep your momentum going?"
    };
}
