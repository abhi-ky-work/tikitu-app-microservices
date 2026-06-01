import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: env('PAYMENT_DATABASE_URL'),
  },
});
