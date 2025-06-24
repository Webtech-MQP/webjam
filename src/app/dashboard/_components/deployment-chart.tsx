"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
};

export function DeploymentChart() {
  return (
    <ChartContainer config={chartConfig}>
        <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
            left: 12,
            right: 12,
        }}
        >
        <CartesianGrid vertical={false} />
        <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
            dataKey="desktop"
            type="monotone"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
        />
        </LineChart>
    </ChartContainer>
  )
}
