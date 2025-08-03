"use client";

import { TrendingUp } from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { getGpPays } from "@/app/api/gp/query";
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
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const chartConfig = {
  GP: {
    label: "GP",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export function GpPays() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gp, setGp] = useState([]);
  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data: any = await getGpPays();
        if (data != null) {
          setGp(data);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 flex-shrink-0">
        <CardTitle className="text-xs sm:text-sm">GP</CardTitle>
        <CardDescription className="text-xs">Par Pays</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pt-1 sm:px-3 sm:pt-2 pb-1">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={gp}
            margin={{ top: 3, right: 8, left: 8, bottom: 15 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="pays"
              tickLine={false}
              tickMargin={3}
              axisLine={false}
              fontSize={8}
              minTickGap={15}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" fill="var(--color-GP)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-xs pt-1 flex-shrink-0">
        <div className="flex gap-1 font-medium text-xs leading-none">
          Nombre de Gp par pays <TrendingUp className="h-3 w-3" />
        </div>
        <div className="leading-none text-xs text-muted-foreground">
          statistique des gp
        </div>
      </CardFooter>
    </Card>
  );
}
/* function CustomTick(props: any) {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-10} y={0} width={30} height={30}>
        <Flag code={payload.value} className="h-4 w-6" />
      </foreignObject>
    </g>
  );
} */
export default GpPays;
