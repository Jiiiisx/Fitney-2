// app/actions.ts
"use server"; // All functions in this file are Server Actions

import { query } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function logWorkoutAction(formData: FormData) {
  const HARDCODED_USER_ID = 1;

  const exerciseId = formData.get("exerciseId");
  const sets = formData.get("sets");
  const reps = formData.get("reps");
  const weight = formData.get("weight");

  if (!exerciseId || !sets || !reps || !weight) return;

  try {
    let sessionResult = await query(
      "SELECT session_id FROM workout_sessions WHERE user_id = $1 AND session_date = CURRENT_DATE",
      [HARDCODED_USER_ID],
    );
    let sessionId = sessionResult.rows[0]?.session_id;

    if (!sessionId) {
      const newSessionResult = await query(
        "INSERT INTO workout_sessions (user_id, session_date) VALUES ($1, CURRENT_DATE) RETURNING session_id",
        [HARDCODED_USER_ID],
      );
      sessionId = newSessionResult.rows[0].session_id;
    }

    await query(
      "INSERT INTO workout_logs (session_id, exercise_id, sets, reps, weight_kg) VALUES ($1, $2, $3, $4, $5)",
      [sessionId, exerciseId, sets, reps, weight],
    );
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error logging workout:", error);
  }
}
