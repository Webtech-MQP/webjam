'use client';
import { MessyButton } from '@/components/messy-button';
import { MessyTag } from '@/components/messy-tag';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-7">
            <header className="flex w-1/2 flex-row flex-nowrap items-center justify-between">
                <h1>MQP</h1>
                <nav className="flex flex-row flex-nowrap gap-5">
                    <MessyButton>How it works</MessyButton>
                    <MessyButton
                        onClick={() => {
                            window.location.href = '/signIn';
                        }}
                    >
                        Sign In
                    </MessyButton>
                </nav>
            </header>
            <section className="flex flex-col items-center pt-15">
                <div>
                    <div className="flex flex-row flex-nowrap">
                        <div className="flex w-3/4 flex-col">
                            <p className="py-1 text-sm">Let&apos;s face it</p>
                            <h1 className="py-5 text-5xl font-bold whitespace-nowrap">This won&apos;t get you hired...</h1>
                        </div>
                        <div className="flex w-1/4 items-end">
                            <Image
                                src="/curved-arrow.svg"
                                alt=""
                                width={180}
                                height={180}
                                style={{
                                    transform: 'translate(-30px, 30px)',
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex w-fit flex-col flex-nowrap rounded-md border border-[#3D444D] bg-[#0d1117] p-2">
                        <p className="p-2 text-xs">Commits</p>
                        <div className="flex w-fit flex-row flex-nowrap gap-[2px]">
                            {Array.from({ length: 40 }).map((x, c: number) => (
                                <div
                                    key={`col${c}`}
                                    className="flex flex-col gap-[2px]"
                                >
                                    {Array.from({ length: 7 }).map((xx, r: number) => {
                                        const highlight = [
                                            { x: 9, y: 2 },
                                            { x: 17, y: 4 },
                                        ].find((p) => p.x === c && p.y === r);

                                        const color = highlight ? 'bg-[#033a16] hover:bg-[#046024]' : 'bg-[#151b23] hover:bg-[#2b3849]';

                                        const tooltip = highlight ? (
                                            <TooltipContent>
                                                <p>1 commit</p>
                                            </TooltipContent>
                                        ) : null;

                                        return (
                                            <Tooltip
                                                key={`col${c}row${r}`}
                                                delayDuration={0}
                                            >
                                                <TooltipTrigger>
                                                    <div className={'h-[17px] w-[17px] rounded-sm ' + color}></div>
                                                </TooltipTrigger>
                                                {tooltip}
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-5 pt-12">
                    <MessyTag textClassName="text-sm">Ready to make something cool?</MessyTag>
                    <h1 className="text-4xl">
                        Time to show off some <span className="font-serif">REAL</span> projects!
                    </h1>
                    <Button asChild>
                        <Link href="/signIn">
                            Get Started <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-5 pt-12">
                    <MessyTag textClassName="text-sm">How does it work?</MessyTag>
                    <p className="text-md max-w-1/2">The landscape of software engineering is rapidly undergoing a transformation driven by the use of AI, evolving software demands, and a changing industry. With AI tools shifting the way developers work, roles for junior developers are increasingly seeking higher qualifications and more experience. At the same time, academic programs for training software engineers often lag behind and do not teach the evolving essential skills for a developer to know, creating a gap between academia and industry. This paper explores the shifts in the present-day software industry, what is expected of a developer, and where gaps in the educational process remain. To address these issues, we designed a game-jam inspired web platform that enables users to collaborate on challenging programming projects using frontline technologies. This gives opportunities and guidance in learning the architectural and soft skills required to be successful in a modern day software engineering career, thus giving students and early-career professionals a competitive edge in the job market.</p>
                </div>
            </section>
        </main>
    );
}
