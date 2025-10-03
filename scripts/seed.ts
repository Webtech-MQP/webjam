import * as authSchema from '@/server/db/schemas/auth';
import * as awardSchema from '@/server/db/schemas/awards';
import * as userSchema from '@/server/db/schemas/profiles';
import * as registrationSchema from '@/server/db/schemas/project-registration';
import * as projectSchema from '@/server/db/schemas/projects';
import { projectEvent } from '@/server/db/schemas/projects';
import { createId } from '@paralleldrive/cuid2';
import { drizzle } from 'drizzle-orm/libsql';
import { reset } from 'drizzle-seed';

const schema = { ...authSchema, ...userSchema, ...projectSchema, ...registrationSchema, ...awardSchema };

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
            imageUrl: 'https://placehold.co/100.png',
            publicEmail: 'brian@example.com',
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
            imageUrl: 'https://placehold.co/100.png',
            publicEmail: 'tyler@example.com',
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
            imageUrl: 'https://placehold.co/100.png',
            publicEmail: 'johnny@example.com',
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
            imageUrl: 'https://placehold.co/100.png',
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
            imageUrl: 'https://placehold.co/100.png',
            contactEmail: 'ace@contactadmin.com',
        },
        {
            userId: userMattH.id,
            displayName: 'Matt Hagger',
            adminRole: 'Super' as adminRoles,
            bio: '',
            imageUrl: 'https://placehold.co/100.png',
            contactEmail: 'matt@contactadmin.com',
        },
        {
            userId: userMatthew.id,
            displayName: 'Matthew Franco',
            adminRole: 'Super' as adminRoles,
            bio: '',
            imageUrl: 'https://placehold.co/100.png',
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
        subtitle: 'Create a full-stack webapp that rethinks how we go about managing our tasks and work',
        description: 'The goal of this project is to design and build a modern task and work management platform that breaks away from traditional models like static to-do lists, calendars, and Kanban boards. Your app should explore new ways of organizing, prioritizing, and completing tasks—whether through innovative UI/UX, smart automation, collaboration tools, or integrations with other services.\n' + 'You should aim to improve how users think about and interact with their work. This could mean introducing adaptive workflows, using AI to assist with prioritization, or designing systems that account for context like focus level, urgency, or energy. Think beyond existing tools like Trello, Todoist, or Notion—what should task management look like if we started from scratch?',
        requirements: 'Full-stack implementation (frontend, backend, database)\n' + 'Support for creating, editing, and managing tasks\n' + 'Some form of prioritization or workflow structure\n' + 'A clearly explained "rethinking" approach: what makes your app different',
        imageUrl: 'https://placehold.co/1080x1920.png',
        status: 'created' as const,
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

    console.log('Seeding project instances...');
    const projectInstanceId = createId();
    await db.insert(schema.projectInstances).values({
        id: projectInstanceId,
        teamName: 'Team Alpha',
        repoUrl: 'https://github.com/example/todo-reimagined',
        projectId: projectId,
    });
    console.log('Project instances seeded!');

    console.log('Seeding project candidate profiles...');
    await db.insert(schema.candidateProfilesToProjectInstances).values([
        { projectInstanceId, candidateId: userBrian.id },
        { projectInstanceId, candidateId: userTyler.id },
    ]);
    console.log('Project candidate profiles seeded!');

    console.log('Seeding project submissions...');
    await db.insert(schema.projectSubmissions).values([
        {
            id: createId(),
            projectInstanceId: projectInstanceId,
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
            projectInstanceId: projectInstanceId,
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
            projectInstanceId: projectInstanceId,
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

    console.log('Seeding registration questions...');
    const timeQuestion = {
        id: createId(),
        question: 'How much time per week are you willing to dedicate to this project?',
        type: 'select' as const,
        options: JSON.stringify(['0-5 hours', '5-10 hours', '10-20 hours', '20+ hours']),
        required: true,
        createdBy: userMattH.id,
        skill: 'time-management',
    };

    const toolsQuestion = {
        id: createId(),
        question: 'What experience do you have with task management tools like Trello, Asana, or similar?',
        type: 'text' as const,
        required: true,
        createdBy: userMattH.id,
        skill: 'trello',
    };

    const teamQuestion = {
        id: createId(),
        question: 'Do you have any past experience working in a team?',
        type: 'text' as const,
        required: true,
        createdBy: userMattH.id,
        skill: 'teamwork',
    };

    await db.insert(schema.projectRegistrationQuestions).values([timeQuestion, toolsQuestion, teamQuestion]);
    console.log('Registration questions seeded!');

    console.log('Connecting questions to project...');
    await db.insert(schema.projectsToRegistrationQuestions).values([
        {
            projectId: projectId,
            questionId: timeQuestion.id,
            order: 0,
        },
        {
            projectId: projectId,
            questionId: toolsQuestion.id,
            order: 1,
        },
    ]);
    // Note: question3 is intentionally not connected to any project
    console.log('Questions connected to project!');

    console.log('Creating a registration for Brian...');
    const registration = {
        id: createId(),
        projectId: projectId,
        candidateId: userBrian.id,
        submittedAt: new Date(),
        status: 'pending' as const,
        preferredRole: 'fullstack' as const,
    };
    await db.insert(schema.projectRegistrations).values(registration);

    console.log('Adding registration answers...');
    await db.insert(schema.projectRegistrationAnswer).values([
        {
            id: createId(),
            registrationId: registration.id,
            questionId: timeQuestion.id,
            answer: '10-20 hours',
        },
        {
            id: createId(),
            registrationId: registration.id,
            questionId: toolsQuestion.id,
            answer: 'I have used Trello for personal projects and Asana during my internship. I am comfortable with both tools and understand the principles of task management and organization.',
        },
    ]);
    console.log('Registration answers added!');

    console.log('Creating a registration for Tyler...');
    const tylerRegistration = {
        id: createId(),
        projectId: projectId,
        candidateId: userTyler.id,
        submittedAt: new Date(),
        status: 'pending' as const,
        preferredRole: 'backend' as const,
    };
    await db.insert(schema.projectRegistrations).values(tylerRegistration);

    console.log("Adding Tyler's registration answers...");
    await db.insert(schema.projectRegistrationAnswer).values([
        {
            id: createId(),
            registrationId: tylerRegistration.id,
            questionId: timeQuestion.id,
            answer: '5-10 hours',
        },
        {
            id: createId(),
            registrationId: tylerRegistration.id,
            questionId: toolsQuestion.id,
            answer: 'I have extensive experience with Jira, Asana, and Linear from my previous full-time role. I also built custom project management tools for my team.',
        },
    ]);
    console.log("Tyler's registration answers added!");

    console.log('Creating a registration for Johnny...');
    const johnnyRegistration = {
        id: createId(),
        projectId: projectId,
        candidateId: userJohnny.id,
        submittedAt: new Date(),
        status: 'pending' as const,
        preferredRole: 'frontend' as const,
    };
    await db.insert(schema.projectRegistrations).values(johnnyRegistration);

    console.log("Adding Johnny's registration answers...");
    await db.insert(schema.projectRegistrationAnswer).values([
        {
            id: createId(),
            registrationId: johnnyRegistration.id,
            questionId: timeQuestion.id,
            answer: '0-5 hours',
        },
        {
            id: createId(),
            registrationId: johnnyRegistration.id,
            questionId: toolsQuestion.id,
            answer: "I've only used basic to-do apps like Apple Reminders and Google Tasks. I'm eager to learn more sophisticated project management tools though!",
        },
    ]);
    console.log("Johnny's registration answers added!");

    console.log('Seeding awards...');

    const awardsData = [
        {
            id: createId(),
            title: 'Innovative Workflow Designer',
            description: 'Awarded for designing an innovative task workflow that enhances productivity and user engagement.',
            imageUrl: 'https://placehold.co/100x100/4CAF50/FFFFFF?text=🚀',
            createdAt: new Date('2025-09-01'),
        },
        {
            id: createId(),
            title: 'Automation Master',
            description: 'Recognized for implementing smart automation features that significantly reduce manual workload.',
            imageUrl: 'https://placehold.co/100x100/2196F3/FFFFFF?text=🤖',
            createdAt: new Date('2025-09-15'),
        },
        {
            id: createId(),
            title: 'Healthcare Hero',
            description: 'Awarded for building a robust and user-friendly patient management system that improves healthcare workflows.',
            imageUrl: 'https://placehold.co/100x100/FF5722/FFFFFF?text=❤️',
            createdAt: new Date('2025-10-01'),
        },
    ];

    await db.insert(schema.awards).values(awardsData);
    console.log('Awards seeded!');

    const projectsAwardsData = [
        { projectId: project1.id, awardId: awardsData[0]!.id },
        { projectId: project1.id, awardId: awardsData[1]!.id },
    ];
    await db.insert(schema.projectAward).values(projectsAwardsData);
    console.log('Projects to awards seeded!');

    const candidateAwardsData = awardsData.map(({ id }, index) => ({
        id: createId(),
        userId: userBrian.id,
        awardId: id,
        projectSubmissionId: null,
        earnedAt: new Date('2024-03-15'),
        displayOrder: index + 1,
        isVisible: true,
    }));

    await db.insert(schema.candidateAward).values(candidateAwardsData);
    console.log('Candidate awards seeded!');

    const BASE_DATE = new Date('2025-09-17T00:00:00Z');

    function addDays(date: Date, days: number): Date {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const weekHeaders = Array.from({ length: 5 }, (_, i) => {
        const weekStart = addDays(BASE_DATE, i * 7);
        const weekEnd = addDays(BASE_DATE, (i + 1) * 7);

        return {
            id: createId(),
            title: `Week ${i + 1}`,
            description: `Timeline header for Week ${i + 1}`,
            startTime: weekStart,
            endTime: weekEnd,
            isHeader: true,
            projectId,
        };
    });

    const events = [
        {
            id: createId(),
            title: 'Meet your teammates',
            description: 'Kickoff session to meet your team.',
            startTime: addDays(BASE_DATE, 0),
            endTime: addDays(BASE_DATE, 6),
            isHeader: false,
            projectId,
        },
        {
            id: createId(),
            title: 'Planning',
            description: 'Plan out the project',
            startTime: addDays(BASE_DATE, 4),
            endTime: addDays(BASE_DATE, 8),
            isHeader: false,
            projectId,
        },
        {
            id: createId(),
            title: 'Code Stuff',
            description: 'The main implementation work.',
            startTime: addDays(BASE_DATE, 4),
            endTime: addDays(BASE_DATE, 28),
            isHeader: false,
            projectId,
        },
        {
            id: createId(),
            title: 'Testing',
            description: 'Final testing and bug fixes.',
            startTime: addDays(BASE_DATE, 24),
            endTime: addDays(BASE_DATE, 30),
            isHeader: false,
            projectId,
        },
        {
            id: createId(),
            title: 'Submit Project',
            description: 'Final project submission for review.',
            startTime: addDays(BASE_DATE, 28),
            endTime: addDays(BASE_DATE, 35),
            isHeader: false,
            projectId,
        },
    ];

    await db.insert(projectEvent).values([...weekHeaders, ...events]);

    console.log('Project Events seeded!');
}

main()
    .then(() => console.log('DB successfully seeded!'))
    .catch((err) => {
        console.error('Error while seeding:', err);
    });
