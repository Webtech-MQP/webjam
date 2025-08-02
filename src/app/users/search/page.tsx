'use client';

import { SkeletonCard } from '@/components/skeleton-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CandidateCard } from '@/features/profiles/candidate-card';
import { api } from '@/trpc/react';
import { Briefcase, ChevronLeft, ChevronRight, Code, Github, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
    const router = useRouter();

    const [searchParams, setSearchParams] = useState({
        name: '',
        location: '',
        language: '',
        experience: '',
        githubUsername: '',
    });

    const [currentPage, setCurrentPage] = useState(1);

    const candidatesQuery = api.candidates.searchCandidates.useQuery({
        name: searchParams.name || undefined,
        location: searchParams.location || undefined,
        language: searchParams.language || undefined,
        experience: searchParams.experience || undefined,
        githubUsername: searchParams.githubUsername || undefined,
        page: currentPage,
        limit: 12,
    });

    const candidates = candidatesQuery.data?.candidates;
    const pagination = candidatesQuery.data?.pagination;

    return (
        <div className="flex h-full flex-col">
            <form className="flex w-full flex-wrap gap-3">
                <div className="w-84">
                    <Input
                        placeholder="Search by name or bio"
                        value={searchParams.name}
                        onChange={(e) => {
                            setSearchParams((prev) => ({ ...prev, name: e.target.value }));
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="relative">
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Location"
                        className="w-40 pl-10"
                        value={searchParams.location}
                        onChange={(e) => {
                            setSearchParams((prev) => ({
                                ...prev,
                                location: e.target.value,
                            }));
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="relative">
                    <Code className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Language"
                        className="w-40 pl-10"
                        value={searchParams.language}
                        onChange={(e) => {
                            setSearchParams((prev) => ({
                                ...prev,
                                language: e.target.value,
                            }));
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="relative">
                    <Briefcase className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Experience"
                        className="w-40 pl-10"
                        value={searchParams.experience}
                        onChange={(e) => {
                            setSearchParams((prev) => ({
                                ...prev,
                                experience: e.target.value,
                            }));
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="relative">
                    <Github className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="GitHub username"
                        className="w-48 pl-10"
                        value={searchParams.githubUsername}
                        onChange={(e) => {
                            setSearchParams((prev) => ({
                                ...prev,
                                githubUsername: e.target.value,
                            }));
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </form>

            <div className="mt-4 flex-1">
                {candidatesQuery.isLoading && (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-auto pb-6">
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {candidates && candidates.length > 0 && (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-auto pb-6">
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                {candidates.map((candidate) => (
                                    <CandidateCard
                                        key={candidate.userId}
                                        displayName={candidate.displayName}
                                        bio={candidate.bio ?? undefined}
                                        location={candidate.location ?? undefined}
                                        language={candidate.language ?? undefined}
                                        experience={candidate.experience ?? undefined}
                                        githubUsername={candidate.user.githubUsername ?? undefined}
                                        linkedinURL={candidate.linkedinURL ?? undefined}
                                        imageUrl={candidate.imageURL ?? undefined}
                                        projectCount={candidate.candidateProfilesToProjects.length}
                                        onClick={() => router.push(`/users/${candidate.userId}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {candidates && candidates.length === 0 && !candidatesQuery.isLoading && <div className="text-muted-foreground text-center">No candidates found.</div>}

                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            {pagination.totalPages > 5 && <span className="text-muted-foreground text-sm">...</span>}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                            disabled={currentPage === pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {pagination && (
                    <div className="text-muted-foreground mt-4 pb-4 text-center text-sm">
                        Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} candidates
                    </div>
                )}
            </div>
        </div>
    );
}
