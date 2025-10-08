import { type Config } from 'drizzle-kit';

import { env } from '@/env';

export default {
    schema: './src/server/db/schemas/',
    dialect: 'sqlite',
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    tablesFilter: ['webjam_*'],
} satisfies Config;
