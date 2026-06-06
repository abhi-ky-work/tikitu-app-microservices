import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env('PARTNER_DATABASE_URL'),
  },
});
