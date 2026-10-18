import { defineConfig } from '@prisma/config';

export default defineConfig({
  // @ts-ignore
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  // @ts-ignore
  migrate: {
    connection: {
      url: process.env.DATABASE_URL!,
    },
  },
});
