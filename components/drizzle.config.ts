import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

//var dari env
dotenv.config({
  path: '.env.local'
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in your enviroment')
}

export default {
  schema: './app/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  }
} satisfies Config;