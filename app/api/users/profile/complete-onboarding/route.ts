import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { verifyAuth } from "@/app/lib/auth";
import { users, userProfiles, userSettings, bodyMeasurements } from "@/app/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { format, differenceInYears } from "date-fns";
import { calculateTDEE } from "@/app/lib/nutrition-calculator";

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const { username, goal, level, location, gender, dob, weight, height } = await req.json();

    if (!goal || !level || !location) {
      return NextResponse.json(
        { error: 'Missing basic onboarding data' },
        { status: 400 }
      );
    }

    // --- CALCULATE TDEE & TARGETS ---
    let tdee = 2000; // Default
    if (gender && dob && weight && height) {
        const age = differenceInYears(new Date(), new Date(dob));
        const activityLevel: any = level === 'advanced' ? 'very_active' : 
                             level === 'intermediate' ? 'moderately_active' : 'lightly_active';
        
        tdee = calculateTDEE({
            gender: gender as any,
            age,
            weight: parseFloat(weight),
            height: parseFloat(height),
            activityLevel
        });
    }

    // Calorie Target based on goal
    let calorieTarget = tdee;
    if (goal === 'lose_weight') calorieTarget -= 500;
    if (goal === 'build_muscle') calorieTarget += 300;

    // Macro Targets (Standard 40/30/30 split)
    const proteinTarget = Math.round((calorieTarget * 0.30) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.40) / 4);
    const fatTarget = Math.round((calorieTarget * 0.30) / 9);

    // 1. Check if username is already taken
    if (username) {
        const existingUsername = await db.query.users.findFirst({
            where: and(
                eq(users.username, username),
                ne(users.id, userId)
            )
        });

        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 409 }
            );
        }
    }

    await db.transaction(async (tx) => {
      // 2. Update table USERS (Username, FullName, Gender & DOB)
      // Sync fullName with username to ensure consistent display name
      const userUpdate: any = {
          gender: gender || null,
          dateOfBirth: dob || null
      };
      
      if (username) {
          userUpdate.username = username;
          userUpdate.fullName = username; // SINKRONISASI NAMA
      }

      await tx.update(users)
        .set(userUpdate)
        .where(eq(users.id, userId));

      // 3. Simpan Goal & Level di USER_PROFILES
      await tx
        .insert(userProfiles)
        .values({
          userId: userId,
          mainGoal: goal,
          experienceLevel: level,
          workoutLocation: location,
          gender: gender || null,
          weight: weight ? weight.toString() : null,
          height: height ? height.toString() : null,
          tdee: tdee,
          calorieTarget: calorieTarget,
          proteinTarget: proteinTarget,
          carbsTarget: carbsTarget,
          fatTarget: fatTarget,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            mainGoal: goal,
            experienceLevel: level,
            workoutLocation: location,
            gender: gender || null,
            weight: weight ? weight.toString() : null,
            height: height ? height.toString() : null,
            tdee: tdee,
            calorieTarget: calorieTarget,
            proteinTarget: proteinTarget,
            carbsTarget: carbsTarget,
            fatTarget: fatTarget,
            updatedAt: new Date(),
          },
        });

      // 4. Simpan Tinggi & Berat di BODY_MEASUREMENTS
      if (height || weight) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        await tx.insert(bodyMeasurements)
          .values({
            userId: userId,
            date: todayStr,
            heightCm: height ? height.toString() : null,
            weightKg: weight ? weight.toString() : null,
          })
          .onConflictDoUpdate({
            target: [bodyMeasurements.userId, bodyMeasurements.date],
            set: {
              heightCm: height ? height.toString() : null,
              weightKg: weight ? weight.toString() : null,
            }
          });
      }

      // 5. Tandai Onboarding Selesai
      await tx
        .insert(userSettings)
        .values({
          userId: userId,
          hasCompletedOnboarding: true,
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            hasCompletedOnboarding: true,
          },
        });
    });

    return NextResponse.json({
      message: 'Onboarding completed and profile saved successfully.',
    });
  } catch (error) {
    console.error('API_COMPLETE_ONBOARDING_ERROR', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
