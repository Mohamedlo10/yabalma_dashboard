"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

export const description = "A multiple line chart"

const chartData = [
  { month: "January", actifs: 860, inactifs: 290 },
  { month: "February", actifs: 964, inactifs: 468 },
  { month: "March", actifs: 1073, inactifs: 546 },
  { month: "April", actifs: 1189, inactifs: 825 },
  { month: "May", actifs: 1311, inactifs: 504 },
  { month: "June", actifs: 1440, inactifs: 784 },
  { month: "August", actifs: 1576, inactifs: 764 },
  { month: "September", actifs: 2119, inactifs: 745 },
  { month: "October", actifs: 3071, inactifs: 726 },
  { month: "November", actifs: 3031, inactifs: 728 },
  { month: "December", actifs: 3200, inactifs: 690 },
];

const chartConfig = {
  actifs: {
    label: "actifs",
    color: "#dc2626",
  },
  inactifs: {
    label: "inactifs",
    color: "#4D4D4D",
  },
} satisfies ChartConfig

export function GPDiag() {
  const currentMonthIndex = new Date().getMonth(); // 0 for January, 11 for December
  const currentData = chartData[currentMonthIndex - 1];
  const previousData = chartData[currentMonthIndex - 2];

  const actifsDifference = ((currentData.actifs - previousData.actifs) / previousData.actifs) * 100;
  const inactifsDifference = ((currentData.inactifs - previousData.inactifs) / previousData.inactifs) * 100;

  return (
    <Card>
      <CardHeader className="w-full">
        <CardTitle className="font-bold text-3xl text-red-600">{currentData.actifs} GP actifs</CardTitle>
        <CardDescription
          className={`flex flex-row gap-2 ${
            actifsDifference > 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          {actifsDifference > 0 ? "+" : "-"}{actifsDifference.toFixed(1)}% d'actifs en ce mois
          <TrendingUp className="h-5 w-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="actifs" fill="var(--color-actifs)" radius={4} />
            <Bar dataKey="inactifs" fill="var(--color-inactifs)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <CardTitle className="font-bold text-2xl text-zinc-600">{currentData.inactifs} GP inactifs</CardTitle>
        <CardDescription
          className={`flex flex-row gap-2 ${
            inactifsDifference > 0 ? "text-red-700" : "text-green-700"
          }`}
        >
          {inactifsDifference > 0 ? "+" : "-"}{Math.abs(inactifsDifference).toFixed(1)}% d'abandons en ce mois
          <TrendingUp className="h-5 w-4" />
        </CardDescription>
      </CardFooter>
    </Card>
  )
}

export default GPDiag;
