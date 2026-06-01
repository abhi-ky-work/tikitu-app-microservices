import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: env('USER_DATABASE_URL'),
  },
});
