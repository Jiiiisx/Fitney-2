// scripts/process-staged-exercises.ts
import pool from '../app/lib/db.ts';

interface StagedExercise {
  api_id: number;
  name: string;
  description: string;
  category_name: string;
  image_url: string | null;
}

/**
 * Processes exercises from the staging table and moves them to the final tables.
 */
async function processStagedData() {
  console.log('Starting to process staged exercises...');
  const client = await pool.connect();

  try {
    // 1. Select all exercises from the staging table
    const { rows: stagedExercises } = await client.query<StagedExercise>(
      'SELECT api_id, name, description, category_name, image_url FROM api_exercises_staging'
    );

    if (stagedExercises.length === 0) {
      console.log('No staged exercises to process.');
      return;
    }

    console.log(`Found ${stagedExercises.length} exercises to process.`);

    let processedCount = 0;

    // 2. Iterate over each exercise and process it
    for (const exercise of stagedExercises) {
      if (!exercise.name || !exercise.category_name) {
        console.warn(`Skipping exercise with missing name or category. API ID: ${exercise.api_id}`);
        continue;
      }

      // a. Get or create the category
      let categoryResult = await client.query(
        'SELECT id FROM categories WHERE name = $1',
        [exercise.category_name]
      );

      let categoryId: number;
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        const newCategoryResult = await client.query(
          'INSERT INTO categories (name) VALUES ($1) RETURNING id',
          [exercise.category_name]
        );
        categoryId = newCategoryResult.rows[0].id;
        console.log(`Created new category: '${exercise.category_name}'`);
      }

      // b. Upsert the exercise into the final table
      const upsertQuery = `
        INSERT INTO exercises (name, description, category_id, image_url, wger_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (wger_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category_id = EXCLUDED.category_id,
          image_url = EXCLUDED.image_url,
          updated_at = NOW();
      `;

      await client.query(upsertQuery, [
        exercise.name,
        exercise.description,
        categoryId,
        exercise.image_url,
        exercise.api_id,
      ]);

      processedCount++;
    }

    console.log(`Successfully processed ${processedCount} exercises.`);

  } catch (error) {
    console.error('Error during data processing:', error);
  } finally {
    client.release();
    console.log('Database connection released.');
  }
}

processStagedData()
  .then(() => {
    console.log('Script finished successfully.');
    pool.end();
  })
  .catch((error) => {
    console.error('Script failed with an error:', error);
    pool.end();
  });
