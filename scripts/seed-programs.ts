import * as dotenv from 'dotenv';
// 1. Load environment variables FIRST
dotenv.config({ path: '.env.local' });

// Types
interface ExerciseData {
  wger_id: number;
  sets?: number;
  reps?: string;
  duration_seconds?: number;
}

interface DayData {
  day_number: number;
  name: string;
  description?: string;
  exercises?: ExerciseData[];
}

interface ProgramData {
  name: string;
  description: string;
  weeks: number;
  days: DayData[];
}

const programs: ProgramData[] = [
  {
    name: 'Beginner Full Body',
    description: 'A 1-week program focusing on full-body workouts to build foundational strength.',
    weeks: 1,
    days: [
      {
        day_number: 1,
        name: 'Full Body A',
        description: 'A mix of upper and lower body exercises.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '8-12' },
          { wger_id: 57, sets: 3, reps: '8-12' },
          { wger_id: 31, sets: 3, reps: '8-12' },
          { wger_id: 56, sets: 3, duration_seconds: 60 },
        ],
      },
      { day_number: 2, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      {
        day_number: 3,
        name: 'Full Body B',
        description: 'A second mix of full body exercises.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '10-15' },
          { wger_id: 57, sets: 3, reps: 'To Failure' },
          { wger_id: 31, sets: 3, reps: 'To Failure' },
          { wger_id: 56, sets: 3, reps: '15-20' },
        ],
      },
      { day_number: 4, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      {
        day_number: 5,
        name: 'Full Body C',
        description: 'A final mix of full body exercises for the week.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '5-8' },
          { wger_id: 31, sets: 3, reps: '8-12' },
          { wger_id: 805, sets: 3, reps: '10-15' },
          { wger_id: 805, sets: 3, reps: '10-15' },
        ],
      },
      { day_number: 6, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      { day_number: 7, name: 'Rest Day', description: 'A day to recover and rebuild.' },
    ],
  },
  {
    name: 'Cardio Kickstarter',
    description: 'A 1-week program to boost cardiovascular endurance and burn calories.',
    weeks: 1,
    days: [
      { day_number: 1, name: 'Steady-State Cardio', description: 'Running on a treadmill for 30 minutes.', exercises: [{ wger_id: 981, duration_seconds: 1800 }] },
      { day_number: 2, name: 'HIIT Session', description: 'High-intensity interval training with burpees.', exercises: [{ wger_id: 57, reps: '8 rounds' }] },
      { day_number: 3, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      { day_number: 4, name: 'Moderate Intensity', description: 'Cycling for 45 minutes.', exercises: [{ wger_id: 981, duration_seconds: 2700 }] },
      { day_number: 5, name: 'Active Recovery', description: 'A light walk for 30 minutes.', exercises: [{ wger_id: 57, duration_seconds: 1800 }] },
      { day_number: 6, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      { day_number: 7, name: 'Rest Day', description: 'A day to recover and rebuild.' },
    ],
  },
  {
    name: 'Strength & Hypertrophy',
    description: 'A 4-day split designed for muscle growth and raw strength.',
    weeks: 1,
    days: [
      {
        day_number: 1,
        name: 'Upper Body Power',
        description: 'Heavy compound movements for the upper body.',
        exercises: [
          { wger_id: 981, sets: 4, reps: '5-8' },
          { wger_id: 57, sets: 4, reps: '5-8' },
          { wger_id: 31, sets: 3, reps: '10-12' },
        ],
      },
      {
        day_number: 2,
        name: 'Lower Body Power',
        description: 'Heavy compound movements for the lower body.',
        exercises: [
          { wger_id: 981, sets: 4, reps: '5-8' },
          { wger_id: 805, sets: 4, reps: '8-10' },
          { wger_id: 56, sets: 3, duration_seconds: 60 },
        ],
      },
      { day_number: 3, name: 'Rest Day', description: 'Active recovery or rest.' },
      {
        day_number: 4,
        name: 'Upper Body Hypertrophy',
        description: 'Higher volume for muscle definition.',
        exercises: [
          { wger_id: 57, sets: 3, reps: '12-15' },
          { wger_id: 31, sets: 3, reps: '12-15' },
          { wger_id: 805, sets: 3, reps: '15' },
        ],
      },
      {
        day_number: 5,
        name: 'Lower Body Hypertrophy',
        description: 'Focusing on quad and hamstring development.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '12-15' },
          { wger_id: 56, sets: 4, duration_seconds: 45 },
          { wger_id: 57, sets: 3, reps: '20' },
        ],
      },
      { day_number: 6, name: 'Rest Day', description: 'Rest and recover.' },
      { day_number: 7, name: 'Rest Day', description: 'Preparation for next week.' },
    ],
  },
  {
    name: 'Home Fitness Core',
    description: 'Zero equipment needed. Focus on core stability and functional bodyweight strength.',
    weeks: 1,
    days: [
      {
        day_number: 1,
        name: 'Core Foundations',
        description: 'Stability exercises for the midsection.',
        exercises: [
          { wger_id: 56, sets: 3, duration_seconds: 60 },
          { wger_id: 57, sets: 3, reps: '15' },
        ],
      },
      { day_number: 2, name: 'Bodyweight Flow', description: 'Mobility and strength combined.', exercises: [{ wger_id: 31, sets: 3, reps: '12' }] },
      { day_number: 3, name: 'Rest', description: 'Rest' },
      { day_number: 4, name: 'Core Blast', description: 'Intense core circuit.', exercises: [{ wger_id: 56, sets: 5, duration_seconds: 45 }] },
      { day_number: 5, name: 'Full Body Bodyweight', description: 'Total body conditioning.', exercises: [{ wger_id: 57, sets: 4, reps: '20' }] },
      { day_number: 6, name: 'Rest', description: 'Rest' },
      { day_number: 7, name: 'Rest', description: 'Rest' },
    ],
  },
];

async function seedPrograms() {
  // 2. Dynamic Import
  const { db } = await import('../app/lib/db');
  const { workoutPrograms, programDays, programDayExercises, exercises } = await import('../app/lib/schema');
  const { eq } = await import('drizzle-orm');

  console.log('🌱 Starting to seed workout programs...');

  try {
    // Check if exercises exist (simple check)
    const exerciseCount = await db.select().from(exercises).limit(1);
    if (exerciseCount.length === 0) {
        console.warn("⚠️ Warning: No exercises found in DB. Program exercises might fail to link. Run 'npm run db:seed-exercises' first.");
    }

    await db.transaction(async (tx) => {
      for (const programData of programs) {
        // Insert Program
        const [newProgram] = await tx.insert(workoutPrograms).values({
            name: programData.name,
            description: programData.description,
            weeks: programData.weeks,
        }).returning();
        
        console.log(`Created Program: ${newProgram.name} (ID: ${newProgram.id})`);

        for (const dayData of programData.days) {
            // Insert Day
            const [newDay] = await tx.insert(programDays).values({
                programId: newProgram.id,
                dayNumber: dayData.day_number,
                name: dayData.name,
                description: dayData.description,
            }).returning();

            if (dayData.exercises && dayData.exercises.length > 0) {
                for (const exData of dayData.exercises) {
                    // Find Exercise ID by wger_id
                    const foundExercise = await tx.query.exercises.findFirst({
                        where: eq(exercises.wgerId, exData.wger_id),
                        columns: { id: true }
                    });

                    if (foundExercise) {
                        await tx.insert(programDayExercises).values({
                            programDayId: newDay.id,
                            exerciseId: foundExercise.id,
                            sets: exData.sets,
                            reps: exData.reps,
                            durationSeconds: exData.duration_seconds,
                        });
                    } else {
                        console.warn(`   ⚠️ Exercise with wger_id ${exData.wger_id} not found. Skipping.`);
                    }
                }
            }
        }
      }
    });

    console.log('✅ Successfully seeded all workout programs.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding programs:', error);
    process.exit(1);
  }
}

seedPrograms();
