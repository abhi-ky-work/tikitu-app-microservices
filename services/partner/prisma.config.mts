import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: env('PARTNER_DATABASE_URL'),
  },
});
