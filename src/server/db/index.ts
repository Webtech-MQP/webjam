import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '@/env';
import * as authSchema from './schemas/auth';
import * as usersSchema from './schemas/profiles';
import * as projectRegistrationSchema from './schemas/project-registration';
import * as projectsSchema from './schemas/projects';

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
    client: Client | undefined;
};

export const client = globalForDb.client ?? createClient({ url: env.DATABASE_URL });
if (env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, {
    schema: { ...usersSchema, ...projectsSchema, ...authSchema, ...projectRegistrationSchema },
});
