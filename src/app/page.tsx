'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Caprasimo } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';

const caprasimo = Caprasimo({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-caprasimo',
});

export default function Home() {
    const [recruiterHover, setRecruiterHover] = useState(true);

    return (
        <main className={`relative ${caprasimo.variable} bg-white h-screen w-screen`}>
            <div
                onMouseEnter={() => setRecruiterHover(true)}
                onMouseLeave={() => setRecruiterHover(false)}
                className="absolute h-full w-2/3 right-0 top-0 bg-amber-100 "
            ></div>
            <div className={cn('z-20 dark bg-background w-7/8 rounded-r-xl py-4 px-8 h-full drop-shadow-lg drop-shadow-black border-r-2 shrink-0 transition-transform translate-0 ease-out duration-300', recruiterHover && '-translate-x-1/3')}>
                <header className="flex flex-row flex-nowrap items-center justify-between">
                    <h1 className="font-(family-name:--font-caprasimo) text-primary">
                        <a href="#">webjam</a>
                    </h1>
                    <nav className="font-(family-name:--font-overpass) flex flex-row flex-nowrap gap-5">
                        <Button
                            onClick={() => {
                                window.location.href = '/sign-in';
                            }}
                            className="flex gap-2 items-center"
                            asChild
                        >
                            <Link href="/sign-in">
                                Get started <ArrowRight />
                            </Link>
                        </Button>
                    </nav>
                </header>
                <div className="flex w-full gap-4">
                    <div className="w-1/4 shrink-0">Commit graph</div>
                    <div className="space-y-8 flex-1 p-12 text-4xl font-(family-name:--font-overpass)">
                        <p>
                            A portfolio you&apos;ll be <span className="text-primary">proud of.</span>
                        </p>
                        <p className="text-5xl">
                            <span className="text-primary font-(family-name:--font-caprasimo)">webjam</span> is a team-based game-jam platform for every type of software.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
