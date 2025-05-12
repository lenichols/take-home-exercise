import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql', // "mysql" | "sqlite" | "postgresql"
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    ssl: {
      rejectUnauthorized: false,
    },
    host: 'takdhomeassignment.c1e0u6y8oisy.us-east-2.rds.amazonaws.com',
    port: 5432,
    user: 'ffdev',
    password: 'ushu86w3jbks8agkuf8bf',
    database: 'takdhomeassignment',
  },
}) satisfies Config;
