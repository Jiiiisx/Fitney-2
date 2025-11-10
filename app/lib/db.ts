import { Pool } from "pg";

// Create a new pool instance.
// The pool will read the connection details from the .env.local file automatically
// because the variable names (PGHOST, PGUSER, etc.) are standard.
const pool = new Pool({
  // You can add additional pool options here if needed,
  // such as connection timeout or max number of clients.
});

// We export a query function that gets a client from the pool,
// runs the query, and then releases the client back to the pool.
export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
