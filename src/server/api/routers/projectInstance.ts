import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { projects, projectsTags, tags } from '@/server/db/schemas/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const projectInstanceRouter = createTRPCRouter({
});
