'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessyTag } from "@/components/messy-tag";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowRight } from "lucide-react";
import { MessyButton } from "@/components/messy-button";
import { ProjectModal } from "@/components/project-modal";


export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-start py-7">
        <header className="w-1/2 flex flex-row flex-nowrap items-center justify-between">
          <h1>MQP</h1>
          <nav className="flex flex-row flex-nowrap gap-5">
            <MessyButton>How it works</MessyButton>
            <MessyButton onClick={()=>{window.location.href="/signIn"}}>Sign In</MessyButton>
          </nav>
        </header>
        <section className="flex flex-col pt-15 items-center">
          <ProjectModal
            title={"Reinvent The To-do List"}
            subtitle={"Create a full-stack webapp that rethinks how we go about managing our tasks and work"}
            starts={"Jan 1st"}
            ends={"Dec 31st"}
            signups={123}
            description={"The goal of this project is to design and build a modern task and work management platform that breaks away from traditional models like static to-do lists, calendars, and Kanban boards. Your app should explore new ways of organizing, prioritizing, and completing tasks—whether through innovative UI/UX, smart automation, collaboration tools, or integrations with other services.\nYou should aim to improve how users think about and interact with their work. This could mean introducing adaptive workflows, using AI to assist with prioritization, or designing systems that account for context like focus level, urgency, or energy. Think beyond existing tools like Trello, Todoist, or Notion—what should task management look like if we started from scratch?"}
            imageUrl="https://placehold.co/1080x1920.png"
            requirements={[
              "Full-stack implementation (frontend, backend, database)",
              "Support for creating, editing, and managing tasks",
              "Some form of prioritization or workflow structure",
              "A clearly explained “rethinking” approach: what makes your app different",
            ]}
            tags={["React","UI Design","Management","Web",]}
            onSignup={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <div>
            <div className="flex flex-row flex-nowrap">
              <div className="w-3/4 flex flex-col">
                <p className="text-sm py-1">Let&apos;s face it</p>
                <h1 className="text-5xl font-bold py-5 whitespace-nowrap">This won&apos;t get you hired...</h1>
              </div>
              <div className="w-1/4 flex items-end">
                <Image
                  src="/curved-arrow.svg"
                  alt=""
                  width={180}
                  height={180}
                  style={{
                    transform:"translate(-30px, 30px)"
                  }}
                />
              </div>
            </div>
            <div className="w-fit flex flex-col flex-nowrap p-2 rounded-md bg-[#0d1117] border border-[#3D444D]">
              <p className="text-xs p-2">Commits</p>
              <div className="w-fit flex flex-row flex-nowrap gap-[2px]">
                {
                  Array.from({length: 40}).map((x,c:number)=>(
                      <div key={`col${c}`} className="flex flex-col gap-[2px]">
                        {
                          Array.from({length:7}).map((xx, r:number)=>{
                            const highlight = [{x: 9, y: 2}, {x: 17, y:4}]
                              .find((p) => p.x === c && p.y === r);

                            const color = highlight
                              ? "bg-[#033a16] hover:bg-[#046024]"
                              : "bg-[#151b23] hover:bg-[#2b3849]";

                            const tooltip = highlight ? (
                              <TooltipContent>
                                <p>1 commit</p>
                              </TooltipContent>
                            ) : null;

                            return (
                              <Tooltip key={`col${c}row${r}`} delayDuration={0}>
                                <TooltipTrigger><div className={"w-[17px] h-[17px] rounded-sm "+color}></div></TooltipTrigger>
                                {tooltip}
                              </Tooltip>
                            )
                          })
                        }
                      </div>
                    )
                  )
                }
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center pt-12 gap-5">
            <MessyTag textClassName="text-sm">Ready to make something cool?</MessyTag>
            <h1 className="text-4xl">Time to show off some <span className="font-serif">REAL</span> projects!</h1>
            <Button asChild >
              <Link href="/signIn">Get Started <ArrowRight/></Link>
            </Button>
          </div>
          <div className="flex flex-col items-center pt-12 gap-5">
            <MessyTag textClassName="text-sm">How does it work?</MessyTag>
            <p className="text-md max-w-1/2">
              The landscape of software engineering is rapidly undergoing a transformation driven by the use of AI, evolving software demands, and a changing industry. With AI tools shifting the way developers work, roles for junior developers are increasingly seeking higher qualifications and more experience. At the same time, academic programs for training software engineers often lag behind and do not teach the evolving essential skills for a developer to know, creating a gap between academia and industry. This paper explores the shifts in the present-day software industry, what is expected of a developer, and where gaps in the educational process remain. To address these issues, we designed a game-jam inspired web platform that enables users to collaborate on  challenging programming projects using frontline technologies. This gives opportunities and guidance in learning the architectural and soft skills required to be successful in a modern day software engineering career, thus giving students and early-career professionals a competitive edge in the job market.
            </p>
          </div>
        </section>
      </main>
  );
}
