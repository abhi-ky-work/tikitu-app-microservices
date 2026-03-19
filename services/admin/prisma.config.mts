import { defineConfig } from '@prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize the driver adapter for runtime usage
const pool = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    url: process.env.ADMIN_DATABASE_URL,
  },
});
