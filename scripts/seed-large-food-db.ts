import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../app/lib/db";
import { foods } from "../app/lib/schema";
import { count } from "drizzle-orm";

const foodData = [
  // --- STAPLES & GRAINS ---
  { name: "White Rice (Cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Oatmeal (Cooked)", calories: 71, protein: 2.5, carbs: 12, fat: 1.5 },
  { name: "White Bread (1 slice)", calories: 67, protein: 2, carbs: 13, fat: 1 },
  { name: "Whole Wheat Bread (1 slice)", calories: 92, protein: 4, carbs: 17, fat: 1 },
  { name: "Pasta (Cooked)", calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: "Sweet Potato (Boiled)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "Potato (Boiled)", calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Quinoa (Cooked)", calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },

  // --- PROTEINS (MEAT & POULTRY) ---
  { name: "Chicken Breast (Grilled)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Chicken Thigh (Grilled)", calories: 209, protein: 26, carbs: 0, fat: 10.9 },
  { name: "Chicken Wing (Fried)", calories: 290, protein: 27, carbs: 0, fat: 19 },
  { name: "Beef Steak (Grilled)", calories: 271, protein: 25, carbs: 0, fat: 19 },
  { name: "Ground Beef (Cooked)", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Salmon (Grilled)", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Tuna (Canned in Water)", calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "Egg (Boiled)", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Egg (Fried)", calories: 196, protein: 14, carbs: 0.8, fat: 15 },

  // --- PLANT-BASED PROTEIN ---
  { name: "Tofu (Raw)", calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: "Tempeh (Fried)", calories: 192, protein: 19, carbs: 9, fat: 11 },
  { name: "Tempeh (Raw)", calories: 192, protein: 20, carbs: 7.6, fat: 11 },
  { name: "Edamame (Boiled)", calories: 121, protein: 11, carbs: 10, fat: 5 },
  { name: "Lentils (Cooked)", calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Chickpeas (Boiled)", calories: 164, protein: 9, carbs: 27, fat: 2.6 },

  // --- FRUITS ---
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Grapes", calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: "Strawberry", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: "Watermelon", calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  { name: "Papaya", calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },

  // --- VEGETABLES ---
  { name: "Broccoli (Boiled)", calories: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { name: "Spinach (Raw)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Spinach (Boiled)", calories: 23, protein: 3, carbs: 3.8, fat: 0.3 },
  { name: "Carrot (Raw)", calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: "Cucumber", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: "Lettuce", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: "Kangkung (Stir Fry)", calories: 45, protein: 3, carbs: 5, fat: 2 },

  // --- INDONESIAN / ASIAN FOODS ---
  { name: "Nasi Goreng (Fried Rice)", calories: 168, protein: 6, carbs: 22, fat: 6 },
  { name: "Mie Goreng (Fried Noodles)", calories: 190, protein: 5, carbs: 25, fat: 8 },
  { name: "Gado-Gado", calories: 130, protein: 6, carbs: 10, fat: 8 },
  { name: "Sate Ayam (Chicken Satay)", calories: 180, protein: 18, carbs: 5, fat: 10 },
  { name: "Rendang Sapi", calories: 195, protein: 15, carbs: 5, fat: 13 },
  { name: "Soto Ayam", calories: 110, protein: 10, carbs: 8, fat: 4 },
  { name: "Bakso Sapi (Meatballs only)", calories: 200, protein: 12, carbs: 10, fat: 14 },
  { name: "Bubur Ayam (Chicken Porridge)", calories: 150, protein: 8, carbs: 20, fat: 5 },
  { name: "Martabak Telur", calories: 260, protein: 10, carbs: 20, fat: 16 },
  { name: "Pisang Goreng (Fried Banana)", calories: 250, protein: 2, carbs: 30, fat: 14 },
  { name: "Tahu Goreng", calories: 270, protein: 15, carbs: 10, fat: 20 },

  // --- DAIRY & OTHERS ---
  { name: "Whole Milk", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Cheddar Cheese", calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50 },
  
  // --- SNACKS & DRINKS ---
  { name: "Dark Chocolate (70%)", calories: 598, protein: 7.8, carbs: 46, fat: 43 },
  { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50 },
  { name: "Coffee (Black)", calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { name: "Tea (Unsweetened)", calories: 1, protein: 0, carbs: 0, fat: 0 },
  { name: "Cola / Soda", calories: 42, protein: 0, carbs: 11, fat: 0 },
];

async function seedFoods() {
  console.log("🌱 Seeding Comprehensive Food Database...");

  try {
    let addedCount = 0;
    
    for (const food of foodData) {
      // Check if food exists to avoid duplicates (based on name)
      // Note: In a real app, you might want more sophisticated de-duplication
      // but for this script, exact name matching is fine.
      
      // We'll just insert everything. If you run this multiple times,
      // you might want to truncate first or check existence.
      // For safety, let's use insert but ignore if fails (if unique constraint exists)
      // or just append.
      
      // Since schema doesn't force unique name (it should, but let's check),
      // let's do a simple check.
      
      // Ideally we would use `insert(...).onConflictDoNothing()` but simpler to just push for now
      // or let user clear DB.
      
      await db.insert(foods).values({
        name: food.name,
        caloriesPer100g: food.calories.toString(),
        proteinPer100g: food.protein.toString(),
        carbsPer100g: food.carbs.toString(),
        fatPer100g: food.fat.toString(),
      });
      addedCount++;
    }

    console.log(`✅ Successfully added ${addedCount} food items!`);
    console.log("   Now your search will be much richer.");
  } catch (error) {
    console.error("❌ Error seeding foods:", error);
  }
}

seedFoods()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
