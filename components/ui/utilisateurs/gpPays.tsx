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
    color: "#dc2626"
  },
} satisfies ChartConfig

export function GpPays() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gp, setGp] = useState([]);
  let [color, setColor] = useState("#ffffff");


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getGpPays()
        if (data !=null) {
          setGp(data)         
        }
        
      } catch (error) {
        console.error("Error fetching room details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])


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
      <CardHeader>
        <CardTitle>GP</CardTitle>
        <CardDescription>Par Pays</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={gp}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="pays"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" fill="var(--color-GP)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Nombre de Gp par pays <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          statistique des gp
        </div>
      </CardFooter>
    </Card>
  )
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
export default GpPays
