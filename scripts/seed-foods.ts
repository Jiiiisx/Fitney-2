import * as dotenv from "dotenv";

// 1. Konfigurasi Environment Variable TERLEBIH DAHULU
dotenv.config({ path: ".env.local" });

const commonFoods = [
  // Staples
  { name: "White Rice (Cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Oatmeal (Cooked)", calories: 71, protein: 2.5, carbs: 12, fat: 1.5 },
  { name: "White Bread (1 slice)", calories: 67, protein: 2, carbs: 13, fat: 1 },
  { name: "Whole Wheat Bread (1 slice)", calories: 92, protein: 4, carbs: 17, fat: 1 },
  { name: "Sweet Potato (Boiled)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "Potato (Boiled)", calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Indomie Goreng (1 pack)", calories: 380, protein: 8, carbs: 54, fat: 14 },

  // Proteins
  { name: "Chicken Breast (Grilled)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Chicken Thigh (Grilled)", calories: 209, protein: 26, carbs: 0, fat: 10.9 },
  { name: "Egg (Boiled)", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Egg (Fried)", calories: 196, protein: 14, carbs: 0.8, fat: 15 },
  { name: "Beef Steak (Grilled)", calories: 271, protein: 26, carbs: 0, fat: 19 },
  { name: "Salmon (Grilled)", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Tofu / Tahu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: "Tempeh / Tempe", calories: 192, protein: 19, carbs: 9, fat: 11 },
  { name: "Whey Protein Scoop", calories: 120, protein: 24, carbs: 3, fat: 1.5 },

  // Fruits & Veggies
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: "Broccoli (Boiled)", calories: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { name: "Spinach (Boiled)", calories: 23, protein: 3, carbs: 3.6, fat: 0.4 },
  { name: "Carrot (Raw)", calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15 },

  // Snacks & Others
  { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50 },
  { name: "Peanut Butter (1 tbsp)", calories: 94, protein: 4, carbs: 3, fat: 8 },
  { name: "Milk (Full Cream)", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Coffee (Black)", calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { name: "Iced Tea (Sweet)", calories: 30, protein: 0, carbs: 8, fat: 0 },
];

async function main() {
  // 2. Import module secara dinamis SETELAH env dimuat
  // Menggunakan RELATIVE PATH (../app/lib/...) agar lebih stabil di script
  const { db } = await import("../app/lib/db");
  const { foods } = await import("../app/lib/schema");

  console.log("🌱 Seeding foods...");

  for (const food of commonFoods) {
    await db.insert(foods).values({
      name: food.name,
      caloriesPer100g: food.calories.toString(),
      proteinPer100g: food.protein.toString(),
      carbsPer100g: food.carbs.toString(),
      fatPer100g: food.fat.toString(),
    }).onConflictDoNothing(); // Prevent duplicates if re-run
  }

  console.log("✅ Done! Added common foods.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
