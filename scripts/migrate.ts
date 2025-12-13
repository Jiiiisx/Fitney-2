import dotenv from 'dotenv';
import path from 'path';

async function runMigration() {
  console.log('Memuat variabel lingkungan dari .env.local...');
  const result = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

  if (result.error) {
    console.error("Error saat memuat file .env.local:", result.error);
    process.exit(1);
  }
  console.log('Variabel lingkungan berhasil dibuat');

  const { db, pool } = await import('../app/lib/db');
  const { migrate } = await import('drizzle-orm/node-postgres/migrator');

  console.log('Menajalnkan migrasi database...');
  try {
    await migrate(db, { migrationsFolder: './drizzle'});
    console.log('Migrasu berhasil diselesaikan!');
  } catch (error) {
    console.log('Error saat menjalankan migrasi:', error);
    process.exit(1);
  } finally {
    console.log('Menutu[ koneksi ke database...');
    await pool.end();
  }
}


runMigration();