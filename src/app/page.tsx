import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import { GanttChart } from "../features/time-tracking/components/gantt-chart";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1>Hello everyone</h1>
        <div style={{ width: "40%" }}>
          <GanttChart
            sections={[
              { start: 0, end: 5, name: "blue", color: "blue" },
              { start: 1, end: 2, name: "green", color: "green" },
            ]}
            progressBar={1.5}
          />
        </div>
      </main>
    </HydrateClient>
  );
}
