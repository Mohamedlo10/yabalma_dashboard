"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useRouter } from "next/navigation";

export const description = "A bar chart with a label";

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
];

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export function BarChartComponent() {
  const router = useRouter();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 flex-shrink-0">
        <CardDescription className="text-xs">Revenue </CardDescription>
        <CardTitle className="flex items-baseline gap-1 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tabular-nums">
          10 765
          <span className="text-xs font-normal tracking-normal text-muted-foreground">
            Euro
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-1 pt-1 sm:px-2 sm:pt-2 pb-1">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 2,
              right: 5,
              left: 5,
              bottom: 10,
            }}
            barCategoryGap="15%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={7}
              minTickGap={12}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="bg-white p-2 shadow-md rounded-md"
                />
              }
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={3}>
              <LabelList
                position="top"
                offset={3}
                className="fill-foreground text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] xl:text-[9px]"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-end gap-1 text-xs pt-1 flex-shrink-0">
        <Button
          type="button"
          onClick={() => router.push("dashboard/finance")}
          className="w-16 sm:w-20 h-6 sm:h-8 font-bold text-xs"
        >
          Voir Details
        </Button>
      </CardFooter>
    </Card>
  );
}
