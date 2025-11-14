// app/lib/nutrition-calculator.ts

export type Gender = 'male' | 'female';

export type ActivityLevel = 
  | 'sedentary'     // little or no exercise
  | 'lightly_active'  // light exercise/sports 1-3 days/week
  | 'moderately_active' // moderate exercise/sports 3-5 days/week
  | 'very_active'     // hard exercise/sports 6-7 days a week
  | 'super_active';   // very hard exercise/physical job & exercise

interface UserData {
  gender: Gender;
  age: number;      // in years
  weight: number;   // in kg
  height: number;   // in cm
  activityLevel: ActivityLevel;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  super_active: 1.9,
};

/**
 * Calculates the Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation.
 * @param data - The user's personal data.
 * @returns The estimated daily calorie needs.
 */
export function calculateTDEE({ gender, age, weight, height, activityLevel }: UserData): number {
  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else { // female
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Get the multiplier for the user's activity level
  const multiplier = activityMultipliers[activityLevel];

  // Calculate TDEE
  const tdee = bmr * multiplier;

  return Math.round(tdee);
}
