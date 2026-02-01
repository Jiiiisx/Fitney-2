import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { verifyAuth } from "@/app/lib/auth";
import { users, userProfiles, userSettings, bodyMeasurements } from "@/app/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { format } from "date-fns";

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
          fullName: username || null, // Juga simpan di profile jika ada kolomnya
          weight: weight ? weight.toString() : null,
          height: height ? height.toString() : null,
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
