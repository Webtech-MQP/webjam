import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import crypto from 'crypto';
import { candidates, users } from "@/server/db/schema";
import { env } from "../src/env";

const client = createClient({
  url: env.DATABASE_URL
});

export const db = drizzle(client);

async function seed() {
  console.log('Seeding users...');
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(users);
  const userBrian = {
    id: crypto.randomUUID(),
    name: "Brian",
    email: "brian@example.com",
    image: "",
  };

  const userTyler = {
    id: crypto.randomUUID(),
    name: "Tyler",
    email: "tyler@example.com",
    image: "",
  };

  await db.insert(users).values([userBrian, userTyler]);
  console.log('Users seeded!');

  console.log('Seeding candidates...');
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(candidates);
  await db.insert(candidates).values([
    {
      userId: userBrian.id,
      bio: "Brian is a newly graduated computer science major who is struggling to find a job. He applies to many big tech companies and is actively on linkedin. He doesn’t have any commitments going on except for applying for jobs, though his parents are getting tired of him living in the basement.",
      location: "Boston",
      language: "JavaScript",
      experience: "0 years",
      githubUsername: "brianhub",
      portfolioURL: "https://brian.dev",
      linkedinURL: "https://linkedin.com/in/brian",
      resumeURL: "https://brian.dev/resume.pdf",
    },
    {
      userId: userTyler.id,
      bio: "Tyler got a cushy high-paying tech job fresh out of school. They were running smooth in their career, working on mid-size web projects with a high-performing team. A year ago, Tyler lost his job when the mass-layoffs hit. He took it as a good opportunity to travel for a few months, but its now time to get back to the real-world. He has 1 young kid to take care of during the day while his SO is at work.",
      location: "San Francisco",
      language: "Go",
      experience: "5 years",
      githubUsername: "laidofftyler",
      portfolioURL: "https://tyler.dev",
      linkedinURL: "https://linkedin.com/in/tyler",
      resumeURL: "https://tyler.dev/resume.pdf",
    },
  ]);
  console.log('Candidates seeded!');
}

seed().catch((err) => {
  console.error('Error while seeding:', err);
});
