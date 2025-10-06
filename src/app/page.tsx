'use client';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const [recruiterHover, setRecruiterHover] = useState(false);
    const [squares, setSquares] = useState<[number, boolean][]>([]);
    const gridRef = useRef<HTMLDivElement>(null);

    const session = useSession();

    const calculateSquares = () => {
        if (!gridRef.current) return;

        const container = gridRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Square size + gap (assuming 4px gap based on gap-1)
        const squareSize = 32; // Base square size in pixels
        const gap = 8;
        const totalSquareSize = squareSize + gap;

        const squaresPerRow = Math.floor((containerWidth + gap) / totalSquareSize);
        const squaresPerColumn = Math.floor((containerHeight + gap) / totalSquareSize);
        const totalSquares = squaresPerRow * squaresPerColumn;

        setSquares(Array.from({ length: totalSquares }, (_, i) => [i, Math.random() < i / squaresPerRow / (totalSquares / squaresPerRow)]));
    };

    useEffect(() => {
        calculateSquares();

        const handleResize = () => {
            calculateSquares();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const animationVariants = {
        hidden: { opacity: 0 },
        visible: (index: number) => ({
            opacity: 1,
            transition: { delay: index * 0.005 },
        }),
    };

    const carouselPlugin = useRef(Autoplay({ delay: 500 }));

    const { data: projects } = api.projects.getAll.useQuery();

    return (
        <main className={`relative bg-white h-screen max-h-screen w-screen`}>
            <div
                onMouseEnter={() => setRecruiterHover(true)}
                onMouseLeave={() => setRecruiterHover(false)}
                className="absolute h-full w-2/3 right-0 top-0 bg-amber-100 "
            ></div>
            <div className={cn('text-foreground dark flex flex-col max-h-full z-20 bg-background w-7/8 rounded-r-xl py-4 px-8 h-full drop-shadow-lg drop-shadow-black border-r-2 shrink-0 transition-transform translate-0 ease-out duration-300', recruiterHover && '-translate-x-1/3')}>
                <header className=" flex flex-row flex-nowrap items-center justify-between">
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
                                {session.data ? 'Go to dashboard' : 'Get started'} <ArrowRight />
                            </Link>
                        </Button>
                    </nav>
                </header>
                <div className="p-10 flex w-full gap-4 flex-1 overflow-auto">
                    <div
                        ref={gridRef}
                        className="w-1/3 max-h-full overflow-hidden shrink-0 grid gap-2"
                        style={{
                            gridTemplateColumns: 'repeat(auto-fit, 32px)',
                            gridTemplateRows: 'repeat(auto-fit, 32px)',
                        }}
                    >
                        {squares.map((s) => (
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                variants={animationVariants}
                                custom={s[0]}
                                key={s[0]}
                                className={cn('rounded-sm bg-neutral-900 w-8 h-8', s[1] && 'delay-100 fade-in-10 bg-green-800 transition-colors')}
                            ></motion.div>
                        ))}
                    </div>
                    <div className="space-y-8 flex-1 text-4xl font-(family-name:--font-overpass)">
                        <p>
                            A portfolio you&apos;ll be <span className="text-primary">proud of.</span>
                        </p>
                        <p className="text-5xl">
                            <span className="text-primary font-(family-name:--font-caprasimo)">webjam</span> is a team-based game-jam platform for every type of software.
                        </p>
                        <div>
                            <Carousel
                                className="mx-10"
                                plugins={[carouselPlugin.current]}
                            >
                                <CarouselContent>
                                    {projects?.map((project) => (
                                        <CarouselItem
                                            className={projects.length > 1 ? 'basis-1/2' : ''}
                                            key={project.id}
                                        >
                                            <ProjectCard {...project} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselNext />
                                <CarouselPrevious />
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
