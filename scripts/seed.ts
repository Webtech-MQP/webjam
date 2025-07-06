import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import crypto from "crypto";
import { createId } from "@paralleldrive/cuid2";
import {
  admins,
  candidates,
  recruiters,
  users,
} from "@/server/db/schemas/users";
import {
  projects,
  tags,
  projectsTags,
  candidatesToProjects,
} from "@/server/db/schemas/projects";
import { env } from "../src/env";

const client = createClient({
  url: env.DATABASE_URL,
});

export const db = drizzle(client);

async function seed() {
  console.log("Seeding users...");
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
  const userJohnny = {
    id: crypto.randomUUID(),
    name: "Johnny",
    email: "johnny@example.com",
    image: "",
  };
  const userSally = {
    id: crypto.randomUUID(),
    name: "Sally",
    email: "sally@recruit.com",
    image: "",
  };
  const userAce = {
    id: crypto.randomUUID(),
    name: "Ace",
    email: "ace@admin.com",
    image: "",
  };
  await db
    .insert(users)
    .values([userBrian, userTyler, userJohnny, userSally, userAce]);
  console.log("Users seeded!");

  console.log("Seeding candidates...");
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
    {
      userId: userJohnny.id,
      bio: "Johnny is a Junior at Wong Institute of Technology. He is very passionate about coding and is hopeful for a successful career post-graduation, though is sometimes worried about the job market from what he sees online. He is taking a full-time course load and only has a couple hours in the evening or on weekends to work on personal projects. He isn’t very confident in his coding ability, despite being a high academic performer",
      location: "An Avg College",
      language: "Python",
      experience: "0 years",
      githubUsername: "johnnycodes",
      portfolioURL: "https://johnny.dev",
      linkedinURL: "https://linkedin.com/in/johnny",
      resumeURL: "https://johnny.dev/resume.pdf",
    },
  ]);
  console.log("Candidates seeded!");

  console.log("Seeding recruiters...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(recruiters);
  await db.insert(recruiters).values([
    {
      userId: userSally.id,
      companyName: "SushiRecruit Inc.",
    },
  ]);
  console.log("Recruiters seeded!");

  console.log("Seeding admin...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(admins);
  await db.insert(admins).values([
    {
      userId: userAce.id,
      // role: "super",
    },
  ]);
  console.log("Admin seeded!");

  console.log("Seeding recruiter list...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  // await db.delete(recruitersToCandidates);
  // await db.insert(recruitersToCandidates).values([
  //   {
  //     recruiterId: userSally.id,
  //     candidateId: userBrian.id,
  //     comments: "Strong portfolio, very passionate.",
  //   },
  //   {
  //     recruiterId: userSally.id,
  //     candidateId: userTyler.id,
  //     comments: "Solid experience",
  //   },
  // ]);
  // console.log("Recruiter candidate lists seeded!");

  console.log("Seeding projects...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(projects);
  const projectId = createId();
  const project1 = {
    id: projectId,
    title: "Reinvent The To-do List",
    description:
      "Create a full-stack webapp that rethinks how we go about managing our tasks and work",
    instructions:
      "The goal of this project is to design and build a modern task and work management platform that breaks away from traditional models like static to-do lists, calendars, and Kanban boards. Your app should explore new ways of organizing, prioritizing, and completing tasks—whether through innovative UI/UX, smart automation, collaboration tools, or integrations with other services.\n" +
      "You should aim to improve how users think about and interact with their work. This could mean introducing adaptive workflows, using AI to assist with prioritization, or designing systems that account for context like focus level, urgency, or energy. Think beyond existing tools like Trello, Todoist, or Notion—what should task management look like if we started from scratch?",
    requirements:
      "Full-stack implementation (frontend, backend, database)\n" +
      "Support for creating, editing, and managing tasks\n" +
      "Some form of prioritization or workflow structure\n" +
      "A clearly explained “rethinking” approach: what makes your app different",
    img: "https://placehold.co/600x400?text=Reinvent+To-do+List",
    deadline: new Date("2025-11-17T00:00:00Z"),
    startDateTime: new Date("2025-08-17T00:00:00Z"),
    endDateTime: new Date("2025-11-24T00:00:00Z"),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userAce.id,
  };
  await db.insert(projects).values(project1);
  console.log("Project seeded!");

  console.log("Seeding tags...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(tags);
  const tagReact = { id: createId(), name: "React" };
  const tagUIDesign = { id: createId(), name: "UI Design" };
  const tagManagement = { id: createId(), name: "Management" };
  const tagWeb = { id: createId(), name: "Web" };
  await db.insert(tags).values([tagReact, tagUIDesign, tagManagement, tagWeb]);
  console.log("Tags seeded!");

  console.log("Seeding Project-tag links...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(projectsTags);
  await db.insert(projectsTags).values([
    { projectId: projectId, tagId: tagReact.id },
    { projectId: projectId, tagId: tagUIDesign.id },
    { projectId: projectId, tagId: tagManagement.id },
    { projectId: projectId, tagId: tagWeb.id },
  ]);
  console.log("Project-tag links seeded!");

  console.log("Seeding project candidates...");
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(candidatesToProjects);
  await db.insert(candidatesToProjects).values([
    { projectId, candidateId: userBrian.id },
    { projectId, candidateId: userTyler.id },
  ]);
  console.log("Project candidates seeded!");
}

seed().catch((err) => {
  console.error("Error while seeding:", err);
});
