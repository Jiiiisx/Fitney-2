import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

declare global {
  var drizzlePool: Pool | undefined;
  var drizzleDb: DrizzleDB | undefined;
}

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Variabel lingkungan POSTGRES_URL tidak diatur. Silakan periksa file .env.local Anda');
}

let pool: Pool;
let db: DrizzleDB;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString: connectionString});
  db = drizzle(pool, { schema });
} else {
  if (!global.drizzlePool) {
    console.log('Membuat koneksi database global baru untuk development...');
    global.drizzlePool = new Pool({ connectionString: connectionString });
    global.drizzleDb = drizzle(global.drizzlePool, { schema });
  }

  pool = global.drizzlePool as Pool;
  db = global.drizzleDb as DrizzleDB;
}

export { pool, db };