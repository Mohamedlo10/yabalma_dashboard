"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { getcommandeAnnonceCount } from "@/app/api/commandes/query"
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
import { CSSProperties, useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export const description = "An interactive area chart"


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

  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [chartData, setchartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getcommandeAnnonceCount()

        if (data != null) {
          setchartData(data)         

        }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  
  const [timeRange, setTimeRange] = React.useState("30d") // Définir par défaut sur 30 jours



 
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="sweet-loading">
          <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }


  return (
    <Card>
      <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Annonces - Commandes</CardTitle>
          <CardDescription>
            Annonces et commandes des {timeRange === "90d" ? "3 derniers mois" : timeRange === "30d" ? "30 derniers jours" : "7 derniers jours"}
          </CardDescription>
        </div>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
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
        </Select> */}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-24">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
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
