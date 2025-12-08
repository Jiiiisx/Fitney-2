import { Pool } from 'pg';

// Enhance the NodeJS global type to include our custom pool property
declare global {
  var _pool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // Production-specific options can go here
  });
} else {
  // In development, use a global variable to preserve the pool across hot-reloads
  if (!global._pool) {
    global._pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  pool = global._pool;
}

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
