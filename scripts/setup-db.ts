// scripts/setup-db.ts
import pool from '../app/lib/db.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const client = await pool.connect();
  console.log('Connected to the database. Setting up schema...');

  try {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'new_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute the SQL script
    await client.query(schemaSQL);
    console.log('Successfully executed schema.sql.');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await client.release();
    console.log('Database connection released.');
  }
}

setupDatabase().catch(err => {
  console.error('Failed to run setup script.');
  process.exit(1);
});
