// scripts/reset-db.ts
import pool from '../app/lib/db.ts';

async function resetDatabase() {
  const client = await pool.connect();
  console.log('Connected to the database. Resetting tables...');

  try {
    await client.query(`
      DROP TABLE IF EXISTS
        users,
        goals,
        food_logs,
        foods,
        workout_logs,
        user_plan_day_exercises,
        user_plan_days,
        user_plans,
        program_day_exercises,
        program_days,
        workout_programs,
        exercises,
        categories,
        api_exercises_staging,
        user_active_plans,
        workout_plan_exercises,
        workout_plans,
        workout_sessions
      CASCADE;
    `);
    console.log('Successfully dropped all tables.');
  } catch (error) {
    console.error('Error resetting database:', error);
    // Re-throw the error to exit the process with a non-zero code
    throw error;
  } finally {
    await client.release();
    console.log('Database connection released.');
  }
}

resetDatabase().catch(err => {
  console.error('Failed to run reset script.');
  process.exit(1);
});
