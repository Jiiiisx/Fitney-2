// scripts/seed-all-exercises.ts
import pool from '../app/lib/db.ts';

// --- Type Definitions ---
interface Translation {
  id: number;
  name: string;
  description: string;
  language: number;
}
interface WgerExercise {
  id: number;
  name: string; // This will be overwritten by the translation
  description: string; // This will be overwritten by the translation
  category: { name: string };
  translations: Translation[];
}
interface WgerApiResponse {
  next: string | null;
  results: WgerExercise[];
}

function cleanHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}

async function fetchAndProcessAllExercises() {
  const client = await pool.connect();
  console.log('Starting to fetch and process all exercises...');

  try {
    // 1. Fetch all exercises from WGER API into memory
    let nextUrl: string | null = 'https://wger.de/api/v2/exerciseinfo/?limit=100&language=2';
    const allExercises: WgerExercise[] = [];
    while (nextUrl) {
      console.log(`Fetching from: ${nextUrl}`);
      const apiResponse = await fetch(nextUrl);
      if (!apiResponse.ok) throw new Error(`API request failed: ${apiResponse.statusText}`);
      const data: WgerApiResponse = await apiResponse.json();
      
      // The old filter was wrong. We need to process each result.
      for (const exercise of data.results) {
        // Find the English translation, which has language ID 2
        const englishTranslation = exercise.translations?.find(t => t.language === 2);

        // Only add the exercise if an English translation exists and it has a name
        if (englishTranslation && englishTranslation.name) {
          // We add the whole original exercise object, plus the specific translation
          // to make processing easier later.
          allExercises.push({
            ...exercise,
            name: englishTranslation.name,
            description: englishTranslation.description,
          });
        }
      }
      nextUrl = data.next;
    }
    console.log(`Total exercises fetched: ${allExercises.length}`);
    if (allExercises.length === 0) {
        console.log('No exercises found to process.');
        return;
    }

    // 2. Process and insert into final tables (in a transaction)
    await client.query('BEGIN');
    console.log('Processing and inserting into database...');
    let processedCount = 0;

    for (const exercise of allExercises) {
      const cleanedDescription = cleanHtml(exercise.description);

      // a. Get or create the category
      let categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [exercise.category.name]);
      let categoryId: number;
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        const newCategoryResult = await client.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [exercise.category.name]);
        categoryId = newCategoryResult.rows[0].id;
      }

      // b. Upsert the exercise into the final 'exercises' table
      const upsertQuery = `
        INSERT INTO exercises (name, description, category_id, wger_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (wger_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category_id = EXCLUDED.category_id,
          updated_at = NOW();
      `;
      await client.query(upsertQuery, [exercise.name, cleanedDescription, categoryId, exercise.id]);
      processedCount++;
    }
    
    await client.query('COMMIT');
    console.log(`Successfully processed and inserted ${processedCount} exercises.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('An error occurred:', error);
  } finally {
    client.release();
    console.log('Database connection released.');
  }
}

fetchAndProcessAllExercises();
