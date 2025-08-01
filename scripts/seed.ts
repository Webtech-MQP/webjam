import * as authSchema from '@/server/db/schemas/auth';
import * as userSchema from '@/server/db/schemas/profiles';
import * as projectSchema from '@/server/db/schemas/projects';
import { createId } from '@paralleldrive/cuid2';
import { drizzle } from 'drizzle-orm/libsql';
import { reset } from 'drizzle-seed';

const schema = { ...authSchema, ...userSchema, ...projectSchema };

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
    await reset(db, schema);
    type userRoles = 'candidate' | 'recruiter' | 'admin';
    console.log('Seeding users...');
    const userBrian = {
        id: createId(),
        name: 'Brian Smith',
        email: 'brian@example.com',
        role: 'candidate' as userRoles,
        githubUsername: 'brianhub',
    };
    const userTyler = {
        id: createId(),
        name: 'Tyler Jones',
        email: 'tyler@example.com',
        role: 'candidate' as userRoles,
        githubUsername: 'laidofftyler',
    };
    const userJohnny = {
        id: createId(),
        name: 'Johnny Lee',
        email: 'johnny@example.com',
        role: 'candidate' as userRoles,
        githubUsername: 'johnnycodes',
    };
    const userSally = {
        id: createId(),
        name: 'Sally Sushi',
        email: 'sally@recruit.com',
        role: 'recruiter' as userRoles,
    };
    const userAce = {
        id: createId(),
        name: 'Ace Beattie',
        email: 'ace@admin.com',
        role: 'admin' as userRoles,
    };
    const userMattH = {
        id: createId(),
        name: 'Matt Hagger',
        email: 'matt@admin.com',
        role: 'admin' as userRoles,
    };
    const userMatthew = {
        id: createId(),
        name: 'Matthew Franco',
        email: 'matthewF@admin.com',
        role: 'admin' as userRoles,
    };
    await db.insert(schema.users).values([userBrian, userTyler, userJohnny, userSally, userAce, userMattH, userMatthew]);
    console.log('Users seeded!');

    console.log('Seeding candidate profiles...');
    await db.insert(schema.candidateProfiles).values([
        {
            userId: userBrian.id,
            displayName: 'Brian Smith',
            bio: "Brian is a newly graduated computer science major who is struggling to find a job. He applies to many big tech companies and is actively on linkedin. He doesn't have any commitments going on except for applying for jobs, though his parents are getting tired of him living in the basement.",
            experience: '0 years',
            location: 'Boston',
            resumeURL: 'https://brian.dev/resume.pdf',
            portfolioURL: 'https://brian.dev',
            linkedinURL: 'https://linkedin.com/in/brian',
            imageURL: 'https://placehold.co/100.png',
        },
        {
            userId: userTyler.id,
            displayName: 'Tyler Jones',
            bio: 'Tyler got a cushy high-paying tech job fresh out of school. They were running smooth in their career, working on mid-size web projects with a high-performing team. A year ago, Tyler lost his job when the mass-layoffs hit. He took it as a good opportunity to travel for a few months, but its now time to get back to the real-world. He has 1 young kid to take care of during the day while his SO is at work.',
            experience: '5 years',
            location: 'San Francisco',
            resumeURL: 'https://tyler.dev/resume.pdf',
            portfolioURL: 'https://tyler.dev',
            linkedinURL: 'https://linkedin.com/in/tyler',
            imageURL: 'https://placehold.co/100.png',
        },
        {
            userId: userJohnny.id,
            displayName: 'Johnny Lee',
            bio: "Johnny is a Junior at Wong Institute of Technology. He is very passionate about coding and is hopeful for a successful career post-graduation, though is sometimes worried about the job market from what he sees online. He is taking a full-time course load and only has a couple hours in the evening or on weekends to work on personal projects. He isn't very confident in his coding ability, despite being a high academic performer",
            experience: '0 years',
            location: 'An Avg College',
            resumeURL: 'https://johnny.dev/resume.pdf',
            portfolioURL: 'https://johnny.dev',
            linkedinURL: 'https://linkedin.com/in/johnny',
            imageURL: 'https://placehold.co/100.png',
        },
    ]);
    console.log('Candidate profiles seeded!');

    await db.insert(schema.candidateReport).values([
        {
            candidateId: userBrian.id,
            reporterId: userTyler.id,
            reason: 'Brian is evil.',
        },
    ]);

    await db.insert(schema.candidateReport).values([
        {
            candidateId: userTyler.id,
            reporterId: userBrian.id,
            reason: 'Tyler is MORE evil.',
        },
    ]);

    console.log('Seeding recruiter profiles...');
    await db.insert(schema.recruiterProfiles).values([
        {
            userId: userSally.id,
            displayName: 'Sally Sushi',
            companyName: 'SushiRecruit Inc.',
            location: 'New York',
            bio: 'Connecting top tech talent with innovative companies.',
            companyWebsite: 'https://sushiInc.com',
            linkedinURL: 'https://linkedin.com/in/sallysushi',
            imageURL: 'https://placehold.co/100.png',
            displayEmail: 'sally@recruit.com',
        },
    ]);
    console.log('Recruiter profiles seeded!');

    console.log('Seeding admin profiles...');
    type adminRoles = 'Reg' | 'Mod' | 'Super' | 'idk';
    await db.insert(schema.adminProfiles).values([
        {
            userId: userAce.id,
            displayName: 'Ace Beattie',
            adminRole: 'Super' as adminRoles,
            bio: '',
            imageURL: 'https://placehold.co/100.png',
            contactEmail: 'ace@contactadmin.com',
        },
        {
            userId: userMattH.id,
            displayName: 'Matt Hagger',
            adminRole: 'Super' as adminRoles,
            bio: '',
            imageURL: 'https://placehold.co/100.png',
            contactEmail: 'matt@contactadmin.com',
        },
        {
            userId: userMatthew.id,
            displayName: 'Matthew Franco',
            adminRole: 'Super' as adminRoles,
            bio: '',
            imageURL: 'https://placehold.co/100.png',
            contactEmail: 'matthewF@contactadmin.com',
        },
    ]);
    console.log('Admin profiles seeded!');

    console.log('Seeding recruiter list...');
    await db.insert(schema.recruitersToCandidates).values([
        {
            recruiterId: userSally.id,
            candidateId: userBrian.id,
            comments: 'Strong portfolio, very passionate.',
        },
        {
            recruiterId: userSally.id,
            candidateId: userTyler.id,
            comments: 'Solid experience',
        },
    ]);
    console.log('Recruiter candidate lists seeded!');

    console.log('Seeding projects...');
    const projectId = createId();
    const project1 = {
        id: projectId,
        title: 'Reinvent The To-do List',
        subTitle: 'The goal of this project is to design and build a modern task and work management platform that breaks away from traditional models like static to-do lists, calendars, and Kanban boards. Your app should explore new ways of organizing, prioritizing, and completing tasks—whether through innovative UI/UX, smart automation, collaboration tools, or integrations with other services.\n' + 'You should aim to improve how users think about and interact with their work. This could mean introducing adaptive workflows, using AI to assist with prioritization, or designing systems that account for context like focus level, urgency, or energy. Think beyond existing tools like Trello, Todoist, or Notion—what should task management look like if we started from scratch?',
        description: 'Create a full-stack webapp that rethinks how we go about managing our tasks and work',
        requirements: 'Full-stack implementation (frontend, backend, database)\n' + 'Support for creating, editing, and managing tasks\n' + 'Some form of prioritization or workflow structure\n' + 'A clearly explained "rethinking" approach: what makes your app different',
        imageURL: 'https://placehold.co/1080x1920.png',
        status: 'upcoming' as 'in-progress' | 'completed' | 'upcoming',
        repoURL: 'https://github.com/Webtech-MQP/prototype-3',
        deadline: new Date('2025-11-17T00:00:00Z'),
        startDateTime: new Date('2025-08-17T00:00:00Z'),
        endDateTime: new Date('2025-11-24T00:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userMattH.id,
    };
    await db.insert(schema.projects).values(project1);
    console.log('Project seeded!');

    console.log('Seeding tags...');
    const tagReact = { id: createId(), name: 'React' };
    const tagUIDesign = { id: createId(), name: 'UI Design' };
    const tagManagement = { id: createId(), name: 'Management' };
    const tagWeb = { id: createId(), name: 'Web' };
    await db.insert(schema.tags).values([tagReact, tagUIDesign, tagManagement, tagWeb]);
    console.log('Tags seeded!');

    console.log('Seeding Project-tag links...');
    await db.insert(schema.projectsTags).values([
        { projectId: projectId, tagId: tagReact.id },
        { projectId: projectId, tagId: tagUIDesign.id },
        { projectId: projectId, tagId: tagManagement.id },
        { projectId: projectId, tagId: tagWeb.id },
    ]);
    console.log('Project-tag links seeded!');

    console.log('Seeding project candidate profiles...');
    await db.insert(schema.candidateProfilesToProjects).values([
        { projectId, candidateId: userBrian.id },
        { projectId, candidateId: userTyler.id },
    ]);
    console.log('Project candidate profiles seeded!');

    console.log('Seeding project submissions...');
    await db.insert(schema.projectSubmissions).values([
        {
            id: createId(),
            projectId: projectId,
            submittedOn: new Date(),
            status: 'submitted',
            reviewedOn: new Date(),
            reviewedBy: userMattH.id,
            notes: 'Initial submission for review.',
            repositoryURL: 'https://github.com/Webtech-MQP/prototype-3',
            deploymentURL: 'https://webjam.com',
            submittedBy: userBrian.id,
        },
        {
            id: createId(),
            projectId: projectId,
            submittedOn: new Date(),
            status: 'under-review',
            reviewedOn: new Date(),
            reviewedBy: userMattH.id,
            notes: 'Waiting for final review.',
            repositoryURL: 'https://github.com/Webtech-MQP/prototype-3',
            deploymentURL: 'https://webjam.com',
            submittedBy: userTyler.id,
        },
        {
            id: createId(),
            projectId: projectId,
            submittedOn: new Date(),
            status: 'approved',
            reviewedOn: new Date(),
            reviewedBy: userMattH.id,
            notes: 'Great app! Looking forward to seeing it in production.',
            repositoryURL: 'https://github.com/Webtech-MQP/prototype-3',
            deploymentURL: 'https://webjam.com',
            submittedBy: userBrian.id,
        },
    ]);
    console.log('Project submissions seeded!');
}

main()
    .then(() => console.log('DB successfully seeded!'))
    .catch((err) => {
        console.error('Error while seeding:', err);
    });
