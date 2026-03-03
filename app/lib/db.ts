import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

type DrizzleDB = NodePgDatabase<typeof schema>;

declare global {
  var drizzlePool: Pool | undefined;
  var drizzleDb: DrizzleDB | undefined;
}

// Use DATABASE_URL (Supabase) as priority, fallback to local if needed
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Database connection string (DATABASE_URL) not found.');
}

let pool: Pool;
let db: NodePgDatabase<typeof schema>;

const isSupabase = connectionString.includes('supabase') || connectionString.includes('pooler');

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ 
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } 
  });
  db = drizzle(pool, { schema });
} else {
  if (!global.drizzlePool) {
    // Extract project ID for logging (safe log)
    const projectId = connectionString.split('@')[0].split('.')[1] || 'Local';
    console.log(`🚀 Connecting to Supabase Project: ${projectId}`);
    
    global.drizzlePool = new Pool({ 
      connectionString: connectionString,
      ssl: isSupabase ? { rejectUnauthorized: false } : false
    });
    global.drizzleDb = drizzle(global.drizzlePool, { schema });
  }

  pool = global.drizzlePool as Pool;
  db = global.drizzleDb as NodePgDatabase<typeof schema>;
}

export { pool, db };