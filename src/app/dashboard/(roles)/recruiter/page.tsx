'use client';

import { Button } from '@/components/ui/button';
import { CandidateCard } from '@/features/profiles/candidate-card';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function RecruiterDashboardPage() {
    const [showLiked, setShowLiked] = useState(true);
    // Mock data for liked candidates
    const likedCandidates = [
        {
            userId: '1',
            displayName: 'Alice Johnson',
            bio: 'Full Stack Developer passionate about React and Node.js.',
            location: 'Boston, MA',
            language: 'JavaScript',
            experience: '5 years',
            user: { githubUsername: 'alicejohnson' },
            linkedinURL: 'https://linkedin.com/in/alicejohnson',
            imageUrl: undefined,
            candidateProfilesToProjectInstances: [{}, {}, {}, {}, {}, {}, {}, {}, {}], // 9 projects
        },
        {
            userId: '2',
            displayName: 'Bob Smith',
            bio: 'Backend engineer with a love for distributed systems.',
            location: 'San Francisco, CA',
            language: 'Go',
            experience: '7 years',
            user: { githubUsername: 'bobsmith' },
            linkedinURL: 'https://linkedin.com/in/bobsmith',
            imageUrl: undefined,
            candidateProfilesToProjectInstances: [{}], // 1 project
        },
        {
            userId: '3',
            displayName: 'Carol Lee',
            bio: 'UI/UX Designer and front-end developer.',
            location: 'Remote',
            language: 'TypeScript',
            experience: '3 years',
            user: { githubUsername: 'carollee' },
            linkedinURL: 'https://linkedin.com/in/carollee',
            imageUrl: undefined,
            candidateProfilesToProjectInstances: [{}, {}], // 2 projects
        },
    ];

    // Example: Placeholder for recruiter stats
    const recruiterStats = {
        totalLiked: likedCandidates.length,
        // Add more stats as needed
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8">
            <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="mb-8 text-gray-600">Welcome! Here you can manage your favorite candidates and more.</p>

            {/* Toggle Liked Candidates List */}
            <div className="mb-4 flex items-center gap-2">
                <Button
                    variant={showLiked ? 'default' : 'outline'}
                    onClick={() => setShowLiked(true)}
                >
                    Liked Candidates
                </Button>
                <Button
                    variant={!showLiked ? 'default' : 'outline'}
                    onClick={() => setShowLiked(false)}
                >
                    {/* Placeholder for another list, e.g., Shortlisted, Contacted, etc. */}
                    Other List
                </Button>
            </div>

            {/* Liked Candidates List */}
            {showLiked && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Liked Candidates</h2>
                    {likedCandidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {likedCandidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.userId}
                                    displayName={candidate.displayName}
                                    bio={candidate.bio ?? undefined}
                                    location={candidate.location ?? undefined}
                                    language={candidate.language ?? undefined}
                                    experience={candidate.experience ?? undefined}
                                    githubUsername={candidate.user.githubUsername ?? undefined}
                                    linkedinURL={candidate.linkedinURL ?? undefined}
                                    imageUrl={candidate.imageUrl ?? undefined}
                                    projectCount={candidate.candidateProfilesToProjectInstances.length}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500">You haven&apos;t liked any candidates yet.</div>
                    )}
                </div>
            )}

            {/* Placeholder for other recruiter dashboard features */}
            {!showLiked && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Other Recruiter Tools</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-500">
                        {/* Add more recruiter dashboard widgets or tools here */}
                        <Plus className="inline-block mr-2" />
                        Feature coming soon!
                    </div>
                </div>
            )}
        </div>
    );
}
