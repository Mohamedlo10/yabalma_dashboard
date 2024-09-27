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
  { month: "January", actifs: 1860, inactifs: 890 },
  { month: "February", actifs: 2359, inactifs: 950 },
  { month: "March", actifs: 2991, inactifs: 1013 },
  { month: "April", actifs: 3794, inactifs: 1081 },
  { month: "May", actifs: 6811, inactifs: 1153 },
  { month: "June", actifs: 6101, inactifs: 1230 },
  { month: "August", actifs: 9737, inactifs: 1312 },
  { month: "September", actifs: 10812, inactifs: 1400 },
  { month: "October", actifs: 13443, inactifs: 1494 },
  { month: "November", actifs: 14780, inactifs: 1593 },
  { month: "December", actifs: 20012, inactifs: 1700 },
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

export function ClientsDiag() {
  const currentMonthIndex = new Date().getMonth(); // 0 for January, 11 for December
  const currentData = chartData[currentMonthIndex - 1];
  const previousData = chartData[currentMonthIndex - 2];

  const actifsDifference = ((currentData.actifs - previousData.actifs) / previousData.actifs) * 100;
  const inactifsDifference = ((currentData.inactifs - previousData.inactifs) / previousData.inactifs) * 100;

  return (
    <Card>
      <CardHeader className="w-full">
        <CardTitle className="font-bold text-3xl text-red-600">{currentData.actifs} Clients actifs</CardTitle>
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
        <CardTitle className="font-bold text-2xl text-zinc-600">{currentData.inactifs} Clients inactifs</CardTitle>
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

export default ClientsDiag;
