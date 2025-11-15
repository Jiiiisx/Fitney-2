// scripts/seed-programs.ts
import pool from '../app/lib/db.ts';

// --- Type Definitions for our Seeder Data ---
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
// --- End of Type Definitions ---

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
          { wger_id: 981, sets: 3, reps: '8-12' }, // Replacement for Barbell Squat
          { wger_id: 57, sets: 3, reps: '8-12' },   // Replacement for Bench Press
          { wger_id: 31, sets: 3, reps: '8-12' },  // Replacement for Bent-over Row
          { wger_id: 56, sets: 3, duration_seconds: 60 }, // Replacement for Plank
        ],
      },
      { day_number: 2, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      {
        day_number: 3,
        name: 'Full Body B',
        description: 'A second mix of full body exercises.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '10-15' }, // Replacement for Dumbbell Lunge
          { wger_id: 57, sets: 3, reps: 'To Failure' }, // Replacement for Push-ups
          { wger_id: 31, sets: 3, reps: 'To Failure' }, // Replacement for Pull-ups
          { wger_id: 56, sets: 3, reps: '15-20' }, // Replacement for Leg Raises
        ],
      },
      { day_number: 4, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      {
        day_number: 5,
        name: 'Full Body C',
        description: 'A final mix of full body exercises for the week.',
        exercises: [
          { wger_id: 981, sets: 3, reps: '5-8' },    // Replacement for Deadlift
          { wger_id: 31, sets: 3, reps: '8-12' },     // Replacement for Overhead Press
          { wger_id: 805, sets: 3, reps: '10-15' },  // Replacement for Dumbbell Bicep Curl
          { wger_id: 805, sets: 3, reps: '10-15' },    // Replacement for Triceps Dip
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
      { day_number: 1, name: 'Steady-State Cardio', description: 'Running on a treadmill for 30 minutes.', exercises: [{ wger_id: 981, duration_seconds: 1800 }] }, // Replacement for Running
      { day_number: 2, name: 'HIIT Session', description: 'High-intensity interval training with burpees.', exercises: [{ wger_id: 57, reps: '8 rounds' }] }, // Replacement for Burpees
      { day_number: 3, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      { day_number: 4, name: 'Moderate Intensity', description: 'Cycling for 45 minutes.', exercises: [{ wger_id: 981, duration_seconds: 2700 }] }, // Replacement for Cycling
      { day_number: 5, name: 'Active Recovery', description: 'A light walk for 30 minutes.', exercises: [{ wger_id: 57, duration_seconds: 1800 }] }, // Replacement for Walking
      { day_number: 6, name: 'Rest Day', description: 'A day to recover and rebuild.' },
      { day_number: 7, name: 'Rest Day', description: 'A day to recover and rebuild.' },
    ],
  },
];

async function seedPrograms() {
  const client = await pool.connect();
  console.log('Starting to seed workout programs...');

  try {
    const countRes = await client.query('SELECT COUNT(*) FROM exercises');
    console.log(`Verification: Found ${countRes.rows[0].count} rows in exercises table.`);

    await client.query('BEGIN');

    for (const programData of programs) {
      // Insert the program
      const programRes = await client.query(
        'INSERT INTO workout_programs (name, description, weeks) VALUES ($1, $2, $3) RETURNING id',
        [programData.name, programData.description, programData.weeks]
      );
      const programId = programRes.rows[0].id;
      console.log(`Inserted program: ${programData.name}`);

      for (const dayData of programData.days) {
        // Insert the day
        const dayRes = await client.query(
          'INSERT INTO program_days (program_id, day_number, name, description) VALUES ($1, $2, $3, $4) RETURNING id',
          [programId, dayData.day_number, dayData.name, dayData.description || null]
        );
        const dayId = dayRes.rows[0].id;

        if (dayData.exercises) {
          for (const exData of dayData.exercises) {
            // Find the exercise_id from the wger_id
            const exRes = await client.query('SELECT id FROM exercises WHERE wger_id = $1', [exData.wger_id]);
            if (exRes.rows.length === 0) {
              console.warn(`Exercise with wger_id ${exData.wger_id} not found. Skipping.`);
              continue;
            }
            const exerciseId = exRes.rows[0].id;

            // Insert the exercise for the day
            await client.query(
              'INSERT INTO program_day_exercises (program_day_id, exercise_id, sets, reps, duration_seconds) VALUES ($1, $2, $3, $4, $5)',
              [dayId, exerciseId, exData.sets || null, exData.reps || null, exData.duration_seconds || null]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded all workout programs.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding programs:', error);
  } finally {
    client.release();
  }
}

seedPrograms();
