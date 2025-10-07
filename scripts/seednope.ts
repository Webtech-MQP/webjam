// @ts-nocheck

import * as authSchema from '@/server/db/schemas/auth';
import * as awardSchema from '@/server/db/schemas/awards';
import * as userSchema from '@/server/db/schemas/profiles';
import * as registrationSchema from '@/server/db/schemas/project-registration';
import * as projectSchema from '@/server/db/schemas/projects';
import { createId } from '@paralleldrive/cuid2';
import { drizzle } from 'drizzle-orm/libsql';
import { reset, seed } from 'drizzle-seed';

const schema = { ...authSchema, ...userSchema, ...projectSchema, ...registrationSchema, ...awardSchema };

const projectNames = ['Real-Time Chat Application', 'Task Management Dashboard', 'E-Commerce Platform', 'Weather Forecast Application', 'Personal Finance Tracker', 'Blog Content Management System', 'Social Media Analytics Tool', 'Recipe Sharing Platform', 'Fitness Workout Tracker', 'Online Code Editor', 'Video Streaming Service', 'Hotel Booking System', 'Student Grade Portal', 'Inventory Management System', 'Music Playlist Generator', 'URL Shortener Service', 'Markdown Note-Taking App', 'Real Estate Listing Platform', 'Job Board Application', 'PDF Document Generator', 'Email Campaign Manager', 'Calendar Scheduling System', 'Image Gallery Manager', 'Forum Discussion Board', 'Quiz Application Platform', 'Password Manager Tool', 'Expense Splitting App', 'Event Ticketing System', 'Restaurant Reservation Platform', 'Ride Sharing Application', 'Language Learning App', 'Portfolio Website Builder', 'Survey Creation Tool', 'Bug Tracking System', 'API Rate Limiter', 'File Sharing Service', 'Podcast Hosting Platform', 'Healthcare Appointment Scheduler', 'Library Management System', 'Customer Relationship Manager', 'Automated Testing Framework', 'Code Snippet Repository', 'Travel Itinerary Planner', 'Auction Bidding Platform', 'Time Tracking Application', 'Flashcard Study Tool', 'Cryptocurrency Price Tracker', 'News Aggregator Platform', 'Collaborative Whiteboard', 'Donation Management System', 'Meeting Room Booking App', 'Kanban Board Project Manager', 'Barcode Scanner Application', 'QR Code Generator Tool', 'Sentiment Analysis Dashboard', 'Log Monitoring System', 'Video Conferencing Platform', 'Pet Adoption Portal', 'Meal Planning Application', 'Car Rental Management System', 'Document Collaboration Tool', 'Sports League Manager', 'Network Traffic Analyzer', 'Automated Backup Service', 'Payroll Processing System', 'Resume Builder Application', 'Feedback Collection Platform', 'Smart Home Control Dashboard', 'Parking Space Finder', 'Freelancer Marketplace', 'Habit Tracking Application', 'Stock Portfolio Manager', 'Game Leaderboard System', 'Content Recommendation Engine', 'Supply Chain Tracker', 'Voting and Polling System', 'Translation Service API', 'Performance Monitoring Dashboard', 'Issue Resolution Tracker', 'Customer Support Chatbot', 'Screenshot Annotation Tool', 'Database Migration Tool', 'OAuth Authentication Service', 'Memory Cache System', 'Load Balancer Implementation', 'Search Engine Indexer', 'Email Verification Service', 'Two-Factor Authentication System', 'Notification Delivery Service', 'Session Management System', 'Rate Limiting Middleware', 'Data Visualization Dashboard', 'Deployment Pipeline Manager', 'Container Orchestration Tool', 'Graph Database Query Engine', 'Stream Processing Pipeline', 'Message Queue System', 'Distributed Cache Service', 'API Gateway Router', 'WebSocket Server Framework'];

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);

    // Reset the database
    await reset(db, schema);
    console.log('Database reset complete!');

    // Define arrays for realistic seed data
    const candidateBios = ['Recent computer science graduate actively seeking opportunities in tech. Strong foundation in algorithms and data structures with a passion for full-stack development.', 'Experienced software engineer with 5+ years in web development. Recently impacted by layoffs but excited to bring expertise to a new team.', 'Computer science student passionate about coding and technology. Looking to gain real-world experience while completing degree.', 'Self-taught developer with a portfolio of personal projects. Eager to transition into a professional software development role.', 'Bootcamp graduate with a background in design. Combines technical skills with strong UX/UI sensibilities.', 'Former consultant looking to pivot into tech. Strong analytical and problem-solving skills with recent coding education.'];

    const recruiterCompanies = ['TechRecruit Solutions', 'InnovateTalent Inc.', 'CodeConnectors LLC', 'FutureTech Staffing', 'DevPlacement Pro', 'DigitalTalent Hub', 'AgileRecruiting', 'TechPipeline Partners', 'StartupStaffing Solutions', 'EliteCode Recruiters'];

    const techLocations = ['San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'New York, NY', 'Denver, CO', 'Portland, OR', 'Chicago, IL', 'Atlanta, GA', 'Remote'];

    const experienceLevels = ['0 years', '1-2 years', '3-5 years', '5+ years', '10+ years'];
    const preferredRoles = ['frontend', 'backend', 'fullstack', 'mobile', 'devops'];
    const adminRoles = ['Reg', 'Mod', 'Super'];
    const userRoles = ['candidate', 'recruiter', 'admin'];

    // Seed the database using drizzle-seed with refinements
    await seed(db, schema, { count: 50, seed: 12345 }).refine((f) => ({
        users: {
            count: 25,
            columns: {
                id: f.default({ defaultValue: () => createId() }),
                name: f.fullName(),
                email: f.email(),
                role: f.weightedRandom([
                    {
                        weight: 0.6,
                        value: f.valuesFromArray({ values: ['candidate'] }),
                    },
                    {
                        weight: 0.3,
                        value: f.valuesFromArray({ values: ['recruiter'] }),
                    },
                    { weight: 0.1, value: f.valuesFromArray({ values: ['admin'] }) },
                ]),
                githubUsername: f.weightedRandom([
                    {
                        weight: 0.7,
                        value: f.default({
                            defaultValue: (index: number) => `user${index}`,
                        }),
                    },
                    { weight: 0.3, value: f.default({ defaultValue: null }) },
                ]),
            },
            with: {
                candidateProfiles: [
                    {
                        weight: 1.0,
                        count: [0, 1],
                        columns: {
                            displayName: f.fullName(),
                            bio: f.valuesFromArray({ values: candidateBios }),
                            experience: f.valuesFromArray({ values: experienceLevels }),
                            location: f.valuesFromArray({ values: techLocations }),
                            resumeURL: f.default({
                                defaultValue: (index: number) => `https://resume-${index}.dev/resume.pdf`,
                            }),
                            portfolioURL: f.default({
                                defaultValue: (index: number) => `https://portfolio-${index}.dev`,
                            }),
                            linkedinURL: f.default({
                                defaultValue: (index: number) => `https://linkedin.com/in/user${index}`,
                            }),
                            imageUrl: f.default({
                                defaultValue: 'https://placehold.co/100.png',
                            }),
                            publicEmail: f.email(),
                        },
                    },
                ],
                recruiterProfiles: [
                    {
                        weight: 1.0,
                        count: [0, 1],
                        columns: {
                            displayName: f.fullName(),
                            companyName: f.valuesFromArray({ values: recruiterCompanies }),
                            location: f.valuesFromArray({ values: techLocations }),
                            bio: f.default({
                                defaultValue: 'Connecting top tech talent with innovative companies.',
                            }),
                            companyWebsite: f.default({
                                defaultValue: (index: number) => `https://company-${index}.com`,
                            }),
                            linkedinURL: f.default({
                                defaultValue: (index) => `https://linkedin.com/in/recruiter${index}`,
                            }),
                            imageUrl: f.default({
                                defaultValue: 'https://placehold.co/100.png',
                            }),
                            displayEmail: f.email(),
                        },
                    },
                ],
                adminProfiles: [
                    {
                        weight: 1.0,
                        count: [0, 1],
                        columns: {
                            displayName: f.fullName(),
                            adminRole: f.valuesFromArray({ values: adminRoles }),
                            bio: f.default({ defaultValue: '' }),
                            imageUrl: f.default({
                                defaultValue: 'https://placehold.co/100.png',
                            }),
                            contactEmail: f.email(),
                        },
                    },
                ],
            },
        },

        tags: {
            count: 15,
            columns: {
                id: f.default({ defaultValue: () => createId() }),
                name: f.valuesFromArray({
                    values: ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'UI Design', 'UX Research', 'Backend', 'Frontend', 'Full Stack', 'Mobile', 'DevOps', 'AI/ML'],
                }),
            },
        },

        projects: {
            count: 5,
            columns: {
                id: f.default({ defaultValue: () => createId() }),
                title: f.valuesFromArray({ values: projectNames }),
                subtitle: f.default({
                    defaultValue: 'Build innovative solutions to real-world problems',
                }),
                description: f.loremIpsum({ sentencesCount: 8 }),
                requirements: f.loremIpsum({ sentencesCount: 4 }),
                imageUrl: f.default({
                    defaultValue: 'https://placehold.co/1080x1920.png',
                }),
                status: f.valuesFromArray({
                    values: ['created', 'active', 'completed'],
                }),
                repoURL: f.default({
                    defaultValue: (index: number) => `https://github.com/project-${index}/repo`,
                }),
                deadline: f.date({ minDate: '2025-01-01', maxDate: '2025-12-31' }),
                startDateTime: f.date({
                    minDate: '2024-08-01',
                    maxDate: '2024-12-31',
                }),
                endDateTime: f.date({ minDate: '2025-01-01', maxDate: '2025-12-31' }),
                createdAt: f.date({ minDate: '2024-01-01', maxDate: '2024-12-31' }),
                updatedAt: f.date({ minDate: '2024-01-01', maxDate: '2024-12-31' }),
                createdBy: f.default({ defaultValue: () => createId() }),
            },
            with: {
                projectInstances: [
                    {
                        weight: 0.8,
                        count: [1, 3],
                        with: {
                            projectSubmissions: {
                                count: 2,
                            },
                        },
                    },
                    { weight: 0.2, count: [0] },
                ],
            },
        },

        projectRegistrationQuestions: {
            count: 8,
            columns: {
                id: f.default({ defaultValue: () => createId() }),
                question: f.valuesFromArray({
                    values: ['How much time per week are you willing to dedicate to this project?', 'What experience do you have with task management tools?', 'Do you have any past experience working in a team?', 'What programming languages are you most comfortable with?', 'Have you worked on similar projects before?', 'What motivates you to work on this project?', 'What do you hope to learn from this experience?', 'How do you handle tight deadlines and pressure?'],
                }),
                type: f.weightedRandom([
                    { weight: 0.6, value: f.valuesFromArray({ values: ['text'] }) },
                    { weight: 0.4, value: f.valuesFromArray({ values: ['select'] }) },
                ]),
                options: f.weightedRandom([
                    {
                        weight: 0.4,
                        value: f.default({
                            defaultValue: JSON.stringify(['0-5 hours', '5-10 hours', '10-20 hours', '20+ hours']),
                        }),
                    },
                    { weight: 0.6, value: f.default({ defaultValue: null }) },
                ]),
                required: f.boolean(),
                createdBy: f.default({ defaultValue: () => createId() }),
                skill: f.valuesFromArray({
                    values: ['time-management', 'teamwork', 'programming', 'project-management', 'communication'],
                }),
            },
            with: {
                projectRegistrationAnswer: [
                    {
                        weight: 1,
                        count: 1,
                        columns: {
                            id: f.default({ defaultValue: () => createId() }),
                            answer: f.default({ defaultValue: null }),
                            createdAt: f.default({ defaultValue: () => new Date() }),
                            updatedAt: f.default({ defaultValue: () => new Date() }),
                        },
                    },
                ],
            },
        },
    }));

    console.log('Base seed data generated!');

    // Add some specific essential data for application functionality
    console.log('Adding essential seed data...');

    console.log('Essential seed data added!');
    console.log('🌱 Database seeding completed successfully!');
}

main().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
});
