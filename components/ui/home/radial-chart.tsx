"use client"
import {
  Card,
  CardContent,
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
import { User } from "lucide-react"
import { Bar, BarChart, XAxis } from "recharts"
import { Button } from "../button"
export const description = "A stacked bar chart with a legend"
const chartData = [
  { nom: "GP", actifs: 3450, inactifs: 1200 },
  { nom: "Client", actifs: 10380, inactifs: 3420 },
]
const chartConfig = {
  actifs: {
    label: "actifs",
    color: "#dc2626",
    icon: User,
  },
  inactifs: {
    label: "inactifs",
    color: "#4D4D4D",
    icon: User,
  },
} satisfies ChartConfig


export function RadialChartComponent() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start p-2"> 
        <CardTitle className="text-red-600 font-bold text-3xl">23 602</CardTitle>
        <CardTitle>Actifs</CardTitle>        
      </CardHeader>

      <CardContent className="flex-1 w-full p-2"> 
      <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="nom"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            
            />
            <Bar
              dataKey="actifs"
              stackId="a"
              fill="var(--color-actifs)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="inactifs"
              stackId="a"
              fill="var(--color-inactifs)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel className="bg-white p-2 shadow-md rounded-md" />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>


      </CardContent>

      <CardFooter className="grid grid-cols-2 items-center gap-1 text-sm p-2"> 
        <div>
          <CardTitle className="text-zinc-500 font-bold text-3xl">2 090</CardTitle>
          <CardTitle>Abandons</CardTitle>
        </div>
        <Button className="w-fit h-10 font-bold">Gerer les Utilisateurs</Button>
      </CardFooter>
    </Card>
  )
}
