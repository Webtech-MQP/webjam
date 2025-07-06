import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessyTag } from "@/components/messy-tag";
import Image from "next/image";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-start">
        <header className="w-1/2 flex flex-row flex-nowrap items-center justify-between">
          <h1>MQP</h1>
          <nav className="flex flex-row flex-nowrap gap-5">
            <span>How it works</span>
            <span>Sign Up</span>
            <Button asChild>
              <Link href="/signIn">Get started</Link>
            </Button>
          </nav>
        </header>
        <section className="w-1/2 flex flex-col pt-15">
          <div className="flex flex-row flex-nowrap">
            <div className="w-2/3 flex flex-col">
              <p>Let&apos;s face it</p>
              <h1>This won&apos;t get you hired...</h1>
            </div>
            <div className="w-1/3 flex items-end">
              <Image
                src="/curved-arrow.svg"
                alt=""
                width={120}
                height={120}
                style={{
                  transform:"translateY(20px)"
                }}
              />
            </div>
          </div>
          <div className="">
            <p>Commits</p>
            <div className="w-fit p-1 flex flex-row flex-nowrap gap-1 rounded-md bg-[#0d1117]">
              {
                Array.from({length: 40}).map((x,i:number)=>(
                    <div key={`col${i}`} className="flex flex-col gap-1">
                      {
                        Array.from({length:7}).map((xx, ii)=>(
                          <div key={`col${i}row${ii}`} className="w-3 h-3 rounded-sm bg-[#151b23]"/>
                        ))
                      }
                    </div>
                  )
                )
              }
            </div>
          </div>
          <div>
            <MessyTag>Ready to make something cool?</MessyTag>
            <h1>Time to show off some <span>REAL</span> projects!</h1>
            <button>Get Started --</button>
          </div>
          <div>
            <MessyTag>How does it work?</MessyTag>
            <p>Long text</p>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}
