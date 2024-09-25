"use client"


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer
} from "@/components/ui/chart"
import { RadialChartComponent } from "./home/radial-chart"

function Actifs() {
  return (
    <div>
         <Card
          className="flex flex-col lg:max-w-md" x-chunk="charts-01-chunk-1"
        >
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
            <div>
              <CardDescription>Resting HR</CardDescription>
              <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
                62
                <span className="text-sm font-normal tracking-normal text-muted-foreground">
                  bpm
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center">
            <ChartContainer
              config={{
                resting: {
                  label: "Resting",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full"
            >
                <RadialChartComponent/>
            </ChartContainer>
          </CardContent>
        </Card>    
    </div>
  )
}

export default Actifs