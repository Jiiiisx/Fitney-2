import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";
import { verifyAuth } from "@/app/lib/auth";
import { userProfiles,userSettings } from "@/app/lib/schema";

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) {
    return auth.error;
  }
  const userId = auth.user.userId;

  try {
    const { goal, level, location } = await req.json();

    if ( !goal || !level || !location ) {
      return NextResponse.json(
        { error: 'Missing onboarding data' },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(userProfiles)
        .values({
          userId: userId,
          mainGoal: goal,
          experienceLevel: level,
          workoutLocation: location,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            mainGoal:goal,
            experienceLevel: level,
            workoutLocation: location,
            updatedAt: new Date(),
          },
        });

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
      message: 'Onboarding completed and profile saved succesfully.',
    });
  } catch (error) {
    console.error('API_COMPLETE_ONBOARDING_ERROR', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}