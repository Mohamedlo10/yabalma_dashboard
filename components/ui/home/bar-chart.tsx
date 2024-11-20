"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useRouter } from 'next/navigation'


export const description = "A bar chart with a label"

const chartData = [
  { month: "January", desktop: 454 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 705 },
  { month: "April", desktop: 821 },
  { month: "May", desktop: 555 },
  { month: "June", desktop: 1200 },
  { month: "July", desktop: 932 },
  { month: "August", desktop: 890 },
  { month: "September", desktop: 1390 },
  { month: "October", desktop: 1100 },
  { month: "November", desktop: 1500 },
  { month: "December", desktop: 1400 },
]

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function BarChartComponent() {

  const router = useRouter()

  return (
    <Card className=" ">
      <CardHeader>
      <CardDescription>Revenue </CardDescription>
      <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                10 765
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  Euro
                </span>
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
              content={<ChartTooltipContent hideLabel  className="bg-white p-2 shadow-md rounded-md" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-end gap-2 text-sm">
      <Button type="button" onClick={() => router.push('dashboard/finance')}  className="w-28 h-10 font-bold">Voir Details</Button>
      </CardFooter> 
    </Card>
  )
}
