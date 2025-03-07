"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import { getClientCount } from "@/app/api/clients/query"
import { getGpCount } from "@/app/api/gp/query"
import { getUsersCount } from "@/app/api/users/query"
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
  ChartStyle,
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
import { useRouter } from 'next/navigation'
import { CSSProperties, useEffect, useState } from "react"
import BeatLoader from "react-spinners/BeatLoader"
import { Button } from "../button"



const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export const description = "An interactive pie chart"

const desktopData = [
  { month: "Client", desktop: 0, fill: "var(--color-Client)" },
  { month: "GP", desktop: 0, fill: "var(--color-GP)" },
]

const chartConfig = {
  Client: {
    label: "Client",
    color: "#4D4D4D",
  },
  GP: {
    label: "GP",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function CirculaireComponent() {
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalGp, setTotalGp] = useState(0);
  const [totalClient, setTotalClient] = useState(0);
  const [totalActifs, setTotalActifs] = useState(0);
  const [totalnonActifs, setTotalnonActifs] = useState(0);
  const [error, setError] = useState(null);
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getUsersCount()

        if (data >= 0) {
           setTotalUsers(data)
        }
        
      } catch (error) {
        console.error("Error fetching Users count details:", error)
      } 
      try {
        const data: any = await getClientCount()

        if (data >= 0) {
          setTotalClient(data)
          desktopData[0].desktop=data
        }
        
      } catch (error) {
        console.error("Error fetching Client details:", error)
      }
      try {
        const data: any = await getGpCount()

        if (data >= 0) {
          setTotalGp(data)
          desktopData[1].desktop=data
        }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])


  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

 
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
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="xl:text-lg  text-sm">Utilisateurs</CardTitle>
          <CardTitle className="text-red-600 font-bold text-4xl xl:text-5xl">{totalUsers}</CardTitle>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-10 xl:w-[100px] w-[70px] rounded-lg xl:pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className=" p-2 aspect-square w-full max-w-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel  className="bg-white p-2 shadow-md rounded-md" />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={50}
              strokeWidth={4}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {desktopData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {desktopData[activeIndex].month}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-end gap-2 ">
      <Button type="button" onClick={()=> router.push('dashboard/utilisateurs')} className="w-fit h-10  text-[9px] xl:text-sm font-bold">Gerer les Utilisateurs</Button>
      </CardFooter> 
    </Card>
  )
}
export default CirculaireComponent