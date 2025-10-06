import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        DATABASE_URL: z.url(),
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        AUTH_GITHUB_ID: z.string(),
        AUTH_GITHUB_SECRET: z.string(),
        AUTH_LINKEDIN_ID: z.string(),
        AUTH_LINKEDIN_SECRET: z.string(),
        GEMINI_API_KEY: z.string().optional(),
        MATCHER_URL: z.string().url().default('http://localhost:8000'),
        AWS_REGION: z.string().optional(),
        AWS_S3_BUCKET_NAME: z.string().optional(),
        AWS_ACCESS_KEY_ID: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
        AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
        AUTH_LINKEDIN_ID: process.env.AUTH_LINKEDIN_ID,
        AUTH_LINKEDIN_SECRET: process.env.AUTH_LINKEDIN_SECRET,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        MATCHER_URL: process.env.MATCHER_URL,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET_NAME: process.env.S3_BUCKET,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});
