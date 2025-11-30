// scripts/check-db.ts
import pool from '@/app/lib/db.js';

async function checkDatabase() {
  const client = await pool.connect();
  console.log('Connected to database. Fetching contents of user_plan_days...');

  try {
    const res = await client.query('SELECT * FROM user_plan_days ORDER BY date, id;');
    
    if (res.rows.length === 0) {
      console.log('Table "user_plan_days" is empty.');
    } else {
      console.log('Contents of "user_plan_days":');
      console.table(res.rows);
    }
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    await client.release();
    console.log('Database connection released.');
  }
}

checkDatabase();
