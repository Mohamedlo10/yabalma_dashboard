"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-08-21", annonces: 150, commande: 200 },
  { date: "2024-08-22", annonces: 180, commande: 420 },
  { date: "2024-08-23", annonces: 470, commande: 610 },
  { date: "2024-08-24", annonces: 190, commande: 430 },
  { date: "2024-08-25", annonces: 200, commande: 640 },
  { date: "2024-08-26", annonces: 310, commande: 350 },
  { date: "2024-08-27", annonces: 220, commande: 260 },
  { date: "2024-08-28", annonces: 430, commande: 270 },
  { date: "2024-08-29", annonces: 640, commande: 780 },
  { date: "2024-08-30", annonces: 750, commande: 890 },
  { date: "2024-08-31", annonces: 260, commande: 350 },
  { date: "2024-09-01", annonces: 270, commande: 310 },
  { date: "2024-09-02", annonces: 280, commande: 320 },
  { date: "2024-09-03", annonces: 290, commande: 330 },
  { date: "2024-09-04", annonces: 300, commande: 340 },
  { date: "2024-09-05", annonces: 310, commande: 350 },
  { date: "2024-09-06", annonces: 320, commande: 360 },
  { date: "2024-09-07", annonces: 330, commande: 370 },
  { date: "2024-09-08", annonces: 340, commande: 380 },
  { date: "2024-09-09", annonces: 350, commande: 390 },
  { date: "2024-09-10", annonces: 360, commande: 400 },
  { date: "2024-09-11", annonces: 370, commande: 410 },
  { date: "2024-09-12", annonces: 380, commande: 420 },
  { date: "2024-09-13", annonces: 390, commande: 430 },
  { date: "2024-09-14", annonces: 600, commande: 440 },
  { date: "2024-09-15", annonces: 810, commande: 450 },
  { date: "2024-09-16", annonces: 720, commande: 860 },
  { date: "2024-09-17", annonces: 630, commande: 770 },
  { date: "2024-09-18", annonces: 540, commande: 480 },
  { date: "2024-09-19", annonces: 450, commande: 490 },
  { date: "2024-09-20", annonces: 360, commande: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  annonces: {
    label: "annonces",
    color: "#dc2626",
  },
  commande: {
    label: "commande",
    color: "#1A6DEA",
  },
} satisfies ChartConfig

export function Commande() {
  const [timeRange, setTimeRange] = React.useState("30d") // Définir par défaut sur 30 jours

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const now = new Date("2024-09-20") // Utiliser la date actuelle fixe pour cet exemple
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const cutoffDate = new Date(now)
    cutoffDate.setDate(now.getDate() - daysToSubtract)
    return date >= cutoffDate
  })

  return (
    <Card>
      <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Annonces - Commandes</CardTitle>
          <CardDescription>
            Annonces et commandes des {timeRange === "90d" ? "3 derniers mois" : timeRange === "30d" ? "30 derniers jours" : "7 derniers jours"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-24">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillannonces" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-annonces)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-annonces)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillcommande" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-commande)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-commande)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                  className="bg-white p-2 shadow-md rounded-md"
                />
              }
            />
            <Area
              dataKey="commande"
              type="natural"
              fill="url(#fillcommande)"
              stroke="var(--color-commande)"
              stackId="a"
            />
            <Area
              dataKey="annonces"
              type="natural"
              fill="url(#fillannonces)"
              stroke="var(--color-annonces)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Commande
