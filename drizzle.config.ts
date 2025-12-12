import type { Config } from 'drizzel-kit';
import * as dotenv from 'dotenv';

//Var dari enviroment
dotenv.config({
  path: '.env.local'
});

export default {
  schema: './scripts/new_schema.sql',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  }
} satisfies Config;