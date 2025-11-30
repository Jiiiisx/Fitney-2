
// scripts/run-full-db-setup.ts
import dotenv from 'dotenv';
import * as pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 1. Configure Environment ---
dotenv.config({ path: '.env.local' });
console.log('Environment variables loaded.');

// --- 2. Database Pool Definition ---
const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
});
console.log('Database pool created.');

// --- 3. Reset Logic ---
async function resetDatabase(client: pg.PoolClient) {
  console.log('Step 1: Resetting tables...');
  await client.query(`
    DROP TABLE IF EXISTS
      user_streaks, user_achievements, achievements, notifications, water_logs, sleep_logs, body_measurements,
      user_settings, post_comments, post_likes, posts, followers, goals, food_logs, foods,
      workout_logs, user_plan_day_exercises, user_plan_days, user_plans, program_day_exercises,
      program_days, workout_programs, exercises, categories
    CASCADE;
  `);
  console.log('-> Successfully dropped all tables.');
}

// --- 4. Setup Logic ---
async function setupDatabase(client: pg.PoolClient) {
  console.log('Step 2: Setting up schema...');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.join(__dirname, 'new_schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  await client.query(schemaSQL);
  console.log('-> Successfully executed schema.sql.');
}

// --- 5. Seed Exercises Logic ---
// Type Definitions
interface Translation { id: number; name: string; description: string; language: number; }
interface WgerExercise { id: number; name: string; description: string; category: { name: string }; translations: Translation[]; }
interface WgerApiResponse { next: string | null; results: WgerExercise[]; }

function cleanHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}

async function seedExercises(client: pg.PoolClient) {
  console.log('Step 3: Seeding exercises...');
  let nextUrl: string | null = 'https://wger.de/api/v2/exerciseinfo/?limit=100';
  const allExercises: WgerExercise[] = [];
  while (nextUrl) {
    console.log(` -> Fetching from: ${nextUrl}`);
    const apiResponse = await fetch(nextUrl);
    if (!apiResponse.ok) throw new Error(`API request failed: ${apiResponse.statusText}`);
    const data: WgerApiResponse = await apiResponse.json();
    for (const exercise of data.results) {
      const englishTranslation = exercise.translations?.find(t => t.language === 2);
      if (englishTranslation && englishTranslation.name) {
        allExercises.push({ ...exercise, name: englishTranslation.name, description: englishTranslation.description });
      }
    }
    nextUrl = data.next;
  }
  console.log(` -> Total exercises fetched with English translations: ${allExercises.length}`);
  if (allExercises.length === 0) {
    console.log('-> No exercises found to process. Skipping exercise seed.');
    return;
  }

  await client.query('BEGIN');
  let processedCount = 0;
  for (const exercise of allExercises) {
    if (!exercise.category?.name) continue;
    const cleanedDescription = cleanHtml(exercise.description);
    let categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [exercise.category.name]);
    let categoryId: number;
    if (categoryResult.rows.length > 0) {
      categoryId = categoryResult.rows[0].id;
    } else {
      const newCategoryResult = await client.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [exercise.category.name]);
      categoryId = newCategoryResult.rows[0].id;
    }
    const upsertQuery = `
      INSERT INTO exercises (name, description, category_id, wger_id) VALUES ($1, $2, $3, $4)
      ON CONFLICT (wger_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, category_id = EXCLUDED.category_id, updated_at = NOW();`;
    await client.query(upsertQuery, [exercise.name, cleanedDescription, categoryId, exercise.id]);
    processedCount++;
  }
  await client.query('COMMIT');
  console.log(`-> Successfully processed and inserted ${processedCount} exercises.`);
}

// --- 6. Seed Programs Logic ---
// Type Definitions
interface ExerciseData { wger_id: number; sets?: number; reps?: string; duration_seconds?: number; }
interface DayData { day_number: number; name: string; description?: string; exercises?: ExerciseData[]; }
interface ProgramData { name: string; description: string; weeks: number; days: DayData[]; }

const programs: ProgramData[] = [
  {
    name: 'Beginner Full Body', description: 'A 1-week program focusing on full-body workouts.', weeks: 1,
    days: [
      { day_number: 1, name: 'Full Body A', exercises: [{ wger_id: 345, sets: 3, reps: '8-12' }, { wger_id: 12, sets: 3, reps: '8-12' }, { wger_id: 192, sets: 3, reps: '8-12' }, { wger_id: 101, sets: 3, duration_seconds: 60 }] },
      { day_number: 2, name: 'Rest Day' },
      { day_number: 3, name: 'Full Body B', exercises: [{ wger_id: 79, sets: 3, reps: '10-15' }, { wger_id: 8, sets: 3, reps: 'To Failure' }, { wger_id: 10, sets: 3, reps: 'To Failure' }, { wger_id: 91, sets: 3, reps: '15-20' }] },
      { day_number: 4, name: 'Rest Day' },
      { day_number: 5, name: 'Full Body C', exercises: [{ wger_id: 95, sets: 3, reps: '5-8' }, { wger_id: 1, sets: 3, reps: '8-12' }, { wger_id: 11, sets: 3, reps: '10-15' }, { wger_id: 2, sets: 3, reps: '10-15' }] },
      { day_number: 6, name: 'Rest Day' },
      { day_number: 7, name: 'Rest Day' },
    ],
  },
  {
    name: 'Cardio Kickstarter', description: 'A 1-week program to boost cardiovascular endurance.', weeks: 1,
    days: [
      { day_number: 1, name: 'Steady-State Cardio', exercises: [{ wger_id: 337, duration_seconds: 1800 }] },
      { day_number: 2, name: 'HIIT Session', exercises: [{ wger_id: 137, reps: '8 rounds' }] },
      { day_number: 3, name: 'Rest Day' },
      { day_number: 4, name: 'Moderate Intensity', exercises: [{ wger_id: 339, duration_seconds: 2700 }] },
      { day_number: 5, name: 'Active Recovery', exercises: [{ wger_id: 336, duration_seconds: 1800 }] },
      { day_number: 6, name: 'Rest Day' },
      { day_number: 7, name: 'Rest Day' },
    ],
  },
];

async function seedPrograms(client: pg.PoolClient) {
  console.log('Step 4: Seeding workout programs...');
  const countRes = await client.query('SELECT COUNT(*) FROM exercises');
  console.log(` -> Verification: Found ${countRes.rows[0].count} rows in exercises table.`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.warn('-> WARNING: No exercises in DB. Seeding programs will result in empty workout days.');
  }
  await client.query('BEGIN');
  for (const programData of programs) {
    const programRes = await client.query('INSERT INTO workout_programs (name, description, weeks) VALUES ($1, $2, $3) RETURNING id', [programData.name, programData.description, programData.weeks]);
    const programId = programRes.rows[0].id;
    for (const dayData of programData.days) {
      const dayRes = await client.query('INSERT INTO program_days (program_id, day_number, name, description) VALUES ($1, $2, $3, $4) RETURNING id', [programId, dayData.day_number, dayData.name, dayData.description || null]);
      const dayId = dayRes.rows[0].id;
      if (dayData.exercises) {
        for (const exData of dayData.exercises) {
          const exRes = await client.query('SELECT id FROM exercises WHERE wger_id = $1', [exData.wger_id]);
          if (exRes.rows.length > 0) {
            const exerciseId = exRes.rows[0].id;
            await client.query('INSERT INTO program_day_exercises (program_day_id, exercise_id, sets, reps, duration_seconds) VALUES ($1, $2, $3, $4, $5)', [dayId, exerciseId, exData.sets || null, exData.reps || null, exData.duration_seconds || null]);
          } else {
            console.warn(` -> Exercise with wger_id ${exData.wger_id} not found in DB. Skipping for program "${programData.name}".`);
          }
        }
      }
    }
  }
  await client.query('COMMIT');
  console.log('-> Successfully seeded all workout programs.');
}

// --- 7. Main Orchestrator ---
async function main() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Full Database Setup ---');
    await resetDatabase(client);
    await setupDatabase(client);
    await seedExercises(client);
    await seedPrograms(client);
    console.log('--- Full Database Setup Completed Successfully! ---');
  } catch (error) {
    console.error('!!! An error occurred during the setup process !!!');
    console.error(error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

main();
