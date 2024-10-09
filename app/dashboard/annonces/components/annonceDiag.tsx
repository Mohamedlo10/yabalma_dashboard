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
  { month: "January", desktop: 54 },
  { month: "February", desktop: 35 },
  { month: "March", desktop: 75 },
  { month: "April", desktop: 81 },
  { month: "May", desktop: 55 },
  { month: "June", desktop: 120 },
  { month: "July", desktop: 92 },
  { month: "August", desktop: 89 },
  { month: "September", desktop: 139 },
  { month: "October", desktop: 110 },
  { month: "November", desktop: 150 },
  { month: "December", desktop: 140 },
]

const chartConfig = {
  desktop: {
    label: "Annonces",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function AnnonceDiag() {
  return (
    <Card className=" w-full">
      <CardHeader>
      <CardDescription>Annonces </CardDescription>
      <CardTitle className="flex items-baseline gap-1 text-2xl tabular-nums">
             745
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
