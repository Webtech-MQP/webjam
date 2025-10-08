import * as authSchema from '@/server/db/schemas/auth';
import * as awardSchema from '@/server/db/schemas/awards';
import * as userSchema from '@/server/db/schemas/profiles';
import * as registrationSchema from '@/server/db/schemas/project-registration';
import * as projectSchema from '@/server/db/schemas/projects';
import { projectEvent } from '@/server/db/schemas/projects';
import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import { drizzle } from 'drizzle-orm/libsql';
import { reset } from 'drizzle-seed';

const schema = {
    ...authSchema,
    ...userSchema,
    ...projectSchema,
    ...registrationSchema,
    ...awardSchema,
};

const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const projectNames = ['Real-Time Chat Application', 'Task Management Dashboard', 'E-Commerce Platform', 'Weather Forecast Application', 'Personal Finance Tracker', 'Blog Content Management System', 'Social Media Analytics Tool', 'Recipe Sharing Platform', 'Fitness Workout Tracker', 'Online Code Editor', 'Video Streaming Service', 'Hotel Booking System', 'Student Grade Portal', 'Inventory Management System', 'Music Playlist Generator', 'URL Shortener Service', 'Markdown Note-Taking App', 'Real Estate Listing Platform', 'Job Board Application', 'PDF Document Generator', 'Email Campaign Manager', 'Calendar Scheduling System', 'Image Gallery Manager', 'Forum Discussion Board', 'Quiz Application Platform', 'Password Manager Tool', 'Expense Splitting App', 'Event Ticketing System', 'Restaurant Reservation Platform', 'Ride Sharing Application', 'Language Learning App', 'Portfolio Website Builder', 'Survey Creation Tool', 'Bug Tracking System', 'API Rate Limiter', 'File Sharing Service', 'Podcast Hosting Platform', 'Healthcare Appointment Scheduler', 'Library Management System', 'Customer Relationship Manager', 'Automated Testing Framework', 'Code Snippet Repository', 'Travel Itinerary Planner', 'Auction Bidding Platform', 'Time Tracking Application', 'Flashcard Study Tool', 'Cryptocurrency Price Tracker', 'News Aggregator Platform', 'Collaborative Whiteboard', 'Donation Management System', 'Meeting Room Booking App', 'Kanban Board Project Manager', 'Barcode Scanner Application', 'QR Code Generator Tool', 'Sentiment Analysis Dashboard', 'Log Monitoring System', 'Video Conferencing Platform', 'Pet Adoption Portal', 'Meal Planning Application', 'Car Rental Management System', 'Document Collaboration Tool', 'Sports League Manager', 'Network Traffic Analyzer', 'Automated Backup Service', 'Payroll Processing System', 'Resume Builder Application', 'Feedback Collection Platform', 'Smart Home Control Dashboard', 'Parking Space Finder', 'Freelancer Marketplace', 'Habit Tracking Application', 'Stock Portfolio Manager', 'Game Leaderboard System', 'Content Recommendation Engine', 'Supply Chain Tracker', 'Voting and Polling System', 'Translation Service API', 'Performance Monitoring Dashboard', 'Issue Resolution Tracker', 'Customer Support Chatbot', 'Screenshot Annotation Tool', 'Database Migration Tool', 'OAuth Authentication Service', 'Memory Cache System', 'Load Balancer Implementation', 'Search Engine Indexer', 'Email Verification Service', 'Two-Factor Authentication System', 'Notification Delivery Service', 'Session Management System', 'Rate Limiting Middleware', 'Data Visualization Dashboard', 'Deployment Pipeline Manager', 'Container Orchestration Tool', 'Graph Database Query Engine', 'Stream Processing Pipeline', 'Message Queue System', 'Distributed Cache Service', 'API Gateway Router', 'WebSocket Server Framework'];

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
    await reset(db, schema);

    type userRoles = 'candidate' | 'recruiter' | 'admin';
    console.log('Seeding users...');
    const users = Array.from({ length: 10 }).map(() => ({
        id: createId(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        githubUsername: faker.internet.username(),
    }));

    await db.insert(schema.users).values(users);
    console.log('Users seeded!');

    console.log('Seeding candidate profiles...');
    const candidateProfiles = users.flatMap((u) =>
        Math.random() > 0.2
            ? {
                  userId: u.id,
                  displayName: u.name,
                  publicEmail: u.email,
                  location: faker.location.state(),
                  bio: faker.person.bio(),
                  linkedinURL: 'https://linkedin.com/in/' + u.githubUsername,
                  imageUrl: faker.image.dataUri({ color: faker.color.rgb() }),
                  bannerUrl: faker.image.urlPicsumPhotos({ width: 1920, height: 1080 }),
              }
            : []
    );

    await db.insert(schema.candidateProfiles).values(candidateProfiles);

    console.log('Candidate profiles seeded!');

    const candidateReports = users.flatMap((u) =>
        Math.random() > 0.7
            ? {
                  candidateId: u.id,
                  reporterId: u.id !== candidateProfiles[0]!.userId ? candidateProfiles[0]!.userId : candidateProfiles[1]!.userId,
                  reason: faker.lorem.sentence(),
              }
            : []
    );

    if (candidateReports.length > 0) await db.insert(schema.candidateReport).values(candidateReports);

    console.log('Seeding recruiter profiles...');
    const recruiterProfiles = users.flatMap((u) =>
        Math.random() > 0.5
            ? {
                  userId: u.id,
                  displayName: u.name,
                  companyName: faker.company.name(),
                  location: faker.location.city(),
                  bio: faker.person.bio(),
                  companyWebsite: faker.internet.url(),
                  linkedinURL: 'https://linkedin.com/in/' + faker.internet.username(),
                  imageUrl: faker.image.personPortrait(),
                  displayEmail: u.email,
              }
            : []
    );

    await db.insert(schema.recruiterProfiles).values(recruiterProfiles);
    console.log('Recruiter profiles seeded!');

    const admin = {
        userId: users[0]!.id,
        displayName: 'Seed Admin',
        bio: '',
        imageUrl: faker.image.avatarGitHub(),
        contactEmail: faker.internet.email(),
    };

    console.log('Seeding admin profiles...');

    await db.insert(schema.adminProfiles).values([admin]);
    console.log('Admin profiles seeded!');

    console.log('Seeding projects...');
    const statuses = ['created', 'judging', 'completed'] as const;
    const projects = Array.from({ length: 20 }).map((_, i) => {
        const [startDate, endDate] = faker.date.betweens({ from: new Date('2025-01-01'), to: new Date('2025-12-31'), count: 2 });

        return {
            id: createId(),
            title: projectNames[i]!,
            subtitle: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            requirements: Array.from({ length: 5 })
                .map(() => faker.lorem.sentence())
                .join('\n'),
            instructions: faker.lorem.paragraph(),
            imageUrl: faker.image.urlPicsumPhotos({ width: 1080, height: 1920 }),
            status: statuses[Math.floor(Math.random() * 3)]!,
            repoURL: 'https://github.com/Webtech-MQP/webjam',
            deadline: endDate!,
            startDateTime: startDate!,
            endDateTime: endDate!,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: admin.userId,
        };
    });

    await db.insert(schema.projects).values(projects);
    console.log('Project seeded!');

    console.log('Seeding tags...');
    const tagReact = { id: createId(), name: 'React' };
    const tagUIDesign = { id: createId(), name: 'UI Design' };
    const tagManagement = { id: createId(), name: 'Management' };
    const tagWeb = { id: createId(), name: 'Web' };
    await db.insert(schema.tags).values([tagReact, tagUIDesign, tagManagement, tagWeb]);
    console.log('Tags seeded!');

    console.log('Seeding Project-tag links...');
    const tags = projects.flatMap((project) =>
        Array.from({ length: 3 }, (_, i) => ({
            projectId: project.id,
            tagId: [tagReact.id, tagUIDesign.id, tagManagement.id, tagWeb.id][i % 4]!,
        }))
    );
    await db.insert(schema.projectsTags).values(tags);
    console.log('Project-tag links seeded!');

    const projectInstances = projects.flatMap((p) =>
        p.status !== 'created' || Math.random() > 0.8
            ? Array.from({ length: Math.floor(Math.random() * 10) }).map(() => ({
                  id: createId(),
                  teamName: `Team ${faker.word.adjective()}`,
                  repoUrl: `https://github.com/example/todo-reimagined-${Math.random().toString(36).substring(7)}`,
                  projectId: p.id,
              }))
            : []
    );

    console.log('Seeding project instances...');
    const projectInstanceId = createId();
    await db.insert(schema.projectInstances).values(projectInstances);
    console.log('Project instances seeded!');

    console.log('Seeding project candidate profiles...');
    const projectAssignments = new Map<string, Set<string>>();

    const candidateProfilesToProjectInstances = projectInstances.flatMap((instance) => {
        const projectId = instance.projectId;
        if (!projectAssignments.has(projectId)) {
            projectAssignments.set(projectId, new Set());
        }
        const assignedSet = projectAssignments.get(projectId)!;

        const desiredCount = randBetween(5, 10);

        // Candidates not yet assigned to any instance for this project
        const availableCandidates = candidateProfiles.filter((cp) => !assignedSet.has(cp.userId));

        if (availableCandidates.length === 0) return [];

        const numberToAssign = Math.min(desiredCount, availableCandidates.length);

        // Randomly select candidates
        const selected = faker.helpers.shuffle(availableCandidates).slice(0, numberToAssign);

        return selected.map((cp) => {
            assignedSet.add(cp.userId);
            return {
                candidateId: cp.userId,
                projectInstanceId: instance.id,
            };
        });
    });
    await db.insert(schema.candidateProfilesToProjectInstances).values(candidateProfilesToProjectInstances).onConflictDoNothing();
    console.log('Project candidate profiles seeded!');

    console.log('Seeding project submissions...');

    const projectSubmissions = projectInstances.flatMap((pi) => {
        const assignedCandidates = candidateProfilesToProjectInstances.filter((cp) => cp.projectInstanceId === pi.id);

        // Only create submissions for project instances with assigned candidates
        if (assignedCandidates.length === 0) {
            return [];
        }

        return Array.from({ length: randBetween(0, 3) }).map(() => ({
            id: createId(),
            projectInstanceId: pi.id,
            submittedOn: faker.date.recent(),
            status: 'submitted' as const,
            reviewedOn: new Date(),
            reviewedBy: Math.random() < 0.5 ? admin.userId : undefined,
            notes: 'Initial submission for review.',
            repositoryURL: pi.repoUrl,
            deploymentURL: 'https://webjam.com',
            submittedBy: assignedCandidates[0]!.candidateId,
        }));
    });
    await db.insert(schema.projectSubmissions).values(projectSubmissions);
    console.log('Project submissions seeded!');

    console.log('Seeding registration questions...');
    const registrationQuestions = Array.from({ length: 10 }).map(() => ({
        id: createId(),
        question: faker.lorem.sentence().slice(0, -1) + '?',
        type: 'select' as const,
        options: JSON.stringify(Array.from({ length: randBetween(2, 5) }).map(() => faker.word.adjective())),
        required: true,
        createdBy: admin.userId,
        skill: faker.word.noun(),
    }));

    await db.insert(schema.projectRegistrationQuestions).values(registrationQuestions);
    console.log('Registration questions seeded!');

    console.log('Connecting questions to project...');
    const projectsToRegistrationQuestions = projects.flatMap((p) =>
        Array.from({ length: randBetween(2, 4) }).map((_, i) => ({
            projectId: p.id,
            questionId: registrationQuestions[randBetween(0, registrationQuestions.length - 1)]!.id,
            order: i,
        }))
    );
    await db.insert(schema.projectsToRegistrationQuestions).values(projectsToRegistrationQuestions).onConflictDoNothing();
    console.log('Questions connected to project!');

    const registrations = candidateProfiles.flatMap((candidate) =>
        faker.helpers
            .shuffle(projects)
            .slice(0, randBetween(12, 13))
            .map((p) => ({
                id: createId(),
                projectId: p.id,
                candidateId: candidate.userId,
                submittedAt: faker.date.recent(),
                status: 'pending' as const,
                // TODO: fix
                preferredRole: 'fullstack' as const,
            }))
    );

    await db.insert(schema.projectRegistrations).values(registrations).onConflictDoNothing();

    const registrationAnswers = registrations.flatMap((registration) => {
        const questions = projectsToRegistrationQuestions.filter((question) => question.projectId === registration.projectId);

        return questions.map((question) => ({
            id: createId(),
            registrationId: registration.id,
            questionId: question.questionId,
            answer: faker.lorem.words(randBetween(1, 5)),
        }));
    });

    console.log('Adding registration answers...');
    await db.insert(schema.projectRegistrationAnswer).values(registrationAnswers).onConflictDoNothing();
    console.log('Registration answers added!');

    console.log('Seeding awards...');

    const awards = Array.from({ length: 5 }).map(() => ({
        id: createId(),
        title: faker.company.buzzPhrase(),
        description: faker.lorem.sentences(randBetween(1, 3)),
        imageUrl: faker.image.urlPicsumPhotos({ height: 400, width: 400 }),
        createdAt: faker.date.past(),
    }));

    await db.insert(schema.awards).values(awards);
    console.log('Awards seeded!');

    const projectsAwards = projects
        .flatMap((project) => {
            const awardIds = awards.map((award) => award.id).filter(() => Math.random() > 0.8);
            return awardIds.map((awardId) => ({ projectId: project.id, awardId }));
        })
        .flat();

    await db.insert(schema.projectAward).values(projectsAwards);
    console.log('Projects to awards seeded!');

    const candidateAwardsData = awards.flatMap((a, index) => {
        const projectIds = projectsAwards.filter((pa) => pa.awardId === a.id);
        const wtf = projectInstances.filter((pi) => pi.projectId === projectIds[0]!.projectId);
        const members = candidateProfilesToProjectInstances.filter((cpi) => wtf.some((pi) => pi.id === cpi.projectInstanceId));

        if (members.length === 0) {
            return [];
        }

        return {
            id: createId(),
            userId: members[0]!.candidateId,
            awardId: a.id,
            projectSubmissionId: null,
            earnedAt: new Date('2024-03-15'),
            displayOrder: index + 1,
            isVisible: true,
        };
    });

    await db.insert(schema.candidateAward).values(candidateAwardsData);
    console.log('Candidate awards seeded!');

    const events = projects.flatMap((p) => {
        const BASE_DATE = p.startDateTime;

        function addDays(date: Date, days: number): Date {
            return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
        }

        const weekHeaders = Array.from({ length: 5 }, (_, i) => {
            const weekStart = addDays(BASE_DATE, i * 7);
            const weekEnd = addDays(BASE_DATE, (i + 1) * 7);

            return {
                id: createId(),
                title: `Week ${i + 1}`,
                startTime: weekStart,
                endTime: weekEnd,
                isHeader: true,
                projectId: p.id,
            };
        });

        const events = [
            {
                id: createId(),
                title: 'Meet your teammates',
                startTime: addDays(BASE_DATE, 0),
                endTime: addDays(BASE_DATE, 6),
                isHeader: false,
                projectId: p.id,
            },
            {
                id: createId(),
                title: 'Planning',
                startTime: addDays(BASE_DATE, 4),
                endTime: addDays(BASE_DATE, 8),
                isHeader: false,
                projectId: p.id,
            },
            {
                id: createId(),
                title: 'Code Stuff',
                startTime: addDays(BASE_DATE, 4),
                endTime: addDays(BASE_DATE, 28),
                isHeader: false,
                projectId: p.id,
            },
            {
                id: createId(),
                title: 'Testing',
                startTime: addDays(BASE_DATE, 24),
                endTime: addDays(BASE_DATE, 30),
                isHeader: false,
                projectId: p.id,
            },
            {
                id: createId(),
                title: 'Submit Project',
                startTime: addDays(BASE_DATE, 28),
                endTime: addDays(BASE_DATE, 35),
                isHeader: false,
                projectId: p.id,
            },
        ];

        return [...weekHeaders, ...events];
    });

    await db.insert(projectEvent).values(events);

    console.log('Project Events seeded!');
}

main()
    .then(() => console.log('DB successfully seeded!'))
    .catch((err) => {
        console.error('Error while seeding:', err);
    });
