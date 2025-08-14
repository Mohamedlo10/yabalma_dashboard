"use client";

import { TrendingUp } from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { getclientPays } from "@/app/api/clients/query";
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
  Client: {
    label: "clients",
    color: "#F7A707",
    gradientStart: "#818cf8",
    gradientEnd: "#4f46e5",
  },
} satisfies ChartConfig;

export function ClientPays() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data: any = await getclientPays();
        if (data != null) {
          setClients(data);
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
      <CardHeader className=" ">
        <CardTitle className="text-xs sm:text-sm">Client</CardTitle>
        <CardDescription className="text-xs">Par Pays</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pt-1 max-h-54  sm:px-3 sm:pt-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={clients}
            margin={{ top: 8, right: 4, left: 4, bottom:1 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="pays"
              tickLine={false}
              tickMargin={1}
              axisLine={false}
              fontSize={10}
              minTickGap={1}
              tickFormatter={(value) => value.slice(0, 8)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" fill="var(--color-Client)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-xs pt-1 flex-shrink-0">
        <div className="flex gap-1 font-medium text-xs leading-none">
          Nombre de clients par pays <TrendingUp className="h-3 w-3" />
        </div>
        <div className="leading-none text-xs text-muted-foreground">
          statistique des clients
        </div>
      </CardFooter>
    </Card>
  );
}

export default ClientPays;
