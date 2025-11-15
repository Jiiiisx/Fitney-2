// scripts/fetch-wger-exercises.ts
import pool from '../app/lib/db.ts';

// Type definitions for the WGER API response
interface WgerExercise {
  id: number;
  name: string;
  description: string;
  category: {
    name: string;
  };
  language: {
    short_name: string;
  };
  images: {
    image: string;
  }[];
}

interface WgerApiResponse {
  next: string | null;
  results: WgerExercise[];
}

/**
 * Cleans HTML tags from a string.
 * @param html The HTML string to clean.
 * @returns A plain text string.
 */
function cleanHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}

/**
 * Fetches all exercises from the WGER API and stores them in the staging table.
 */
async function fetchAndStageExercises() {
  console.log('Starting to fetch exercises from WGER API...');
  let nextUrl: string | null = 'https://wger.de/api/v2/exerciseinfo/?limit=100&language=2'; // Language 2 is English

  let totalFetched = 0;
  const allExercises = [];

  // 1. Fetch all exercises from the paginated API
  while (nextUrl) {
    try {
      console.log(`Fetching from: ${nextUrl}`);
      const response = await fetch(nextUrl);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data: WgerApiResponse = await response.json();
      
      allExercises.push(...data.results);
      totalFetched += data.results.length;
      
      nextUrl = data.next;
    } catch (error) {
      console.error('Failed to fetch a page:', error);
      nextUrl = null; // Stop on error
    }
  }

  console.log(`Total exercises fetched from API: ${allExercises.length}`);

  if (allExercises.length === 0) {
    console.log('No exercises to stage. Exiting.');
    return;
  }

  // 2. Process and insert data into the database
  console.log('Staging fetched exercises into the database...');
  const client = await pool.connect();

  try {
    for (const exercise of allExercises) {
      // We only care about English exercises for consistency, and skip exercises with no language data
      if (!exercise.language || exercise.language.short_name !== 'en') {
        continue;
      }

      const cleanedDescription = cleanHtml(exercise.description);
      const imageUrl = exercise.images.length > 0 ? exercise.images[0].image : null;

      const insertQuery = `
        INSERT INTO api_exercises_staging (api_id, name, description, category_name, image_url, raw_data)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (api_id) DO NOTHING;
      `;

      await client.query(insertQuery, [
        exercise.id,
        exercise.name,
        cleanedDescription,
        exercise.category.name,
        imageUrl,
        JSON.stringify(exercise), // Store the original object as JSONB
      ]);
    }
    
    console.log(`Staging complete. Processed ${allExercises.length} exercises.`);

  } catch (error) {
    console.error('Error during database insertion:', error);
  } finally {
    client.release();
    console.log('Database connection released.');
  }
}

fetchAndStageExercises()
  .then(() => {
    console.log('Script finished successfully.');
  })
  .catch((error) => {
    console.error('Script failed with an error:', error);
  });
