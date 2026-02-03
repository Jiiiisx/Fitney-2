import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

declare global {
  var drizzlePool: Pool | undefined;
  var drizzleDb: DrizzleDB | undefined;
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Variabel lingkungan DATABASE_URL atau POSTGRES_URL tidak diatur. Silakan periksa file .env Anda');
}

let pool: Pool;
let db: DrizzleDB;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ 
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Sering dibutuhkan oleh Supabase/Neon di production
  });
  db = drizzle(pool, { schema });
} else {
  if (!global.drizzlePool) {
    console.log('Membuat koneksi database global baru untuk development...');
    global.drizzlePool = new Pool({ 
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });
    global.drizzleDb = drizzle(global.drizzlePool, { schema });
  }

  pool = global.drizzlePool as Pool;
  db = global.drizzleDb as DrizzleDB;
}

export { pool, db };