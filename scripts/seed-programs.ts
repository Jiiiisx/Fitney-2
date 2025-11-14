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
        exercises: [
          { wger_id: 192, sets: 3, reps: '8-12' }, // Barbell Squat
          { wger_id: 1, sets: 3, reps: '8-12' },   // Bench Press
          { wger_id: 10, sets: 3, reps: '8-12' },  // Bent-over Row
          { wger_id: 207, sets: 3, duration_seconds: 60 }, // Plank
        ],
      },
      { day_number: 2, name: 'Rest Day' },
      {
        day_number: 3,
        name: 'Full Body B',
        exercises: [
          { wger_id: 201, sets: 3, reps: '10-15' }, // Dumbbell Lunge
          { wger_id: 212, sets: 3, reps: 'To Failure' }, // Push-ups
          { wger_id: 101, sets: 3, reps: 'To Failure' }, // Pull-ups
          { wger_id: 105, sets: 3, reps: '15-20' }, // Leg Raises
        ],
      },
      { day_number: 4, name: 'Rest Day' },
      {
        day_number: 5,
        name: 'Full Body C',
        exercises: [
          { wger_id: 74, sets: 3, reps: '5-8' },    // Deadlift
          { wger_id: 4, sets: 3, reps: '8-12' },     // Overhead Press
          { wger_id: 19, sets: 3, reps: '10-15' },  // Dumbbell Bicep Curl
          { wger_id: 8, sets: 3, reps: '10-15' },    // Triceps Dip
        ],
      },
      { day_number: 6, name: 'Rest Day' },
      { day_number: 7, name: 'Rest Day' },
    ],
  },
  {
    name: 'Cardio Kickstarter',
    description: 'A 1-week program to boost cardiovascular endurance and burn calories.',
    weeks: 1,
    days: [
      { day_number: 1, name: 'Steady-State Cardio', exercises: [{ wger_id: 124, duration_seconds: 1800 }] }, // Running (Treadmill)
      { day_number: 2, name: 'HIIT Session', exercises: [{ wger_id: 353, reps: '8 rounds' }] }, // Burpees
      { day_number: 3, name: 'Rest Day' },
      { day_number: 4, name: 'Moderate Intensity', exercises: [{ wger_id: 12, duration_seconds: 2700 }] }, // Cycling
      { day_number: 5, name: 'Active Recovery', exercises: [{ wger_id: 15, duration_seconds: 1800 }] }, // Walking
      { day_number: 6, name: 'Rest Day' },
      { day_number: 7, name: 'Rest Day' },
    ],
  },
];

async function seedPrograms() {
  const client = await pool.connect();
  console.log('Starting to seed workout programs...');

  try {
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
    pool.end();
  }
}

seedPrograms();
