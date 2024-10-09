"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart with a label"

const chartData = [
  { month: "January", desktop: 14 },
  { month: "February", desktop: 35 },
  { month: "March", desktop: 25 },
  { month: "April", desktop: 11 },
  { month: "May", desktop: 15 },
  { month: "June", desktop: 12 },
  { month: "July", desktop: 22 },
  { month: "August", desktop: 19 },
  { month: "September", desktop: 19 },
  { month: "October", desktop: 10 },
  { month: "November", desktop: 50 },
  { month: "December", desktop: 40 },
]

const chartConfig = {
  desktop: {
    label: "Commandes",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function CommandeDiag() {
  return (
    <Card className=" w-full">
      <CardHeader>
      <CardDescription>Commandes </CardDescription>
      <CardTitle className="flex items-baseline gap-1 text-2xl tabular-nums">
             205
      </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
            barCategoryGap="25%" // Augmente l'espacement entre les barres

          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed"  className="bg-white p-2 shadow-md rounded-md" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground font-bold"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
