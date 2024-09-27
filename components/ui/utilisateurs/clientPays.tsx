"use client";

import { TrendingUp } from "lucide-react";
import Flag from "react-world-flags";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A bar chart";

const chartData = [
  { pays: "Senegal", code: "SN", Client: 886 },
  { pays: "France", code: "FR", Client: 305 },
  { pays: "Belgique", code: "BE", Client: 237 },
  { pays: "Guinee Bissau", code: "GW", Client: 73 },
  { pays: "Mali", code: "ML", Client: 209 },
  { pays: "Suisse", code: "CH", Client: 214 },
  { pays: "Cameroun", code: "CM", Client: 186 },
  { pays: "Maroc", code: "MA", Client: 305 },
  { pays: "Espagne", code: "ES", Client: 637 },
  { pays: "Italie", code: "IT", Client: 373 },
  { pays: "England", code: "GB", Client: 109 },
  { pays: "USA", code: "US", Client: 214 },
];

const chartConfig = {
  Client: {
    label: "clients",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export function ClientPays() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
        <CardDescription>Par Pays</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="code"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={<CustomTick />}
            />
             <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="Client" fill="var(--color-Client)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this pays <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 payss
        </div>
      </CardFooter>
    </Card>
  );
}

function CustomTick(props: any) {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-10} y={0} width={30} height={30}>
        <Flag code={payload.value} className="h-4 w-6" />
      </foreignObject>
    </g>
  );
}

export default ClientPays;
