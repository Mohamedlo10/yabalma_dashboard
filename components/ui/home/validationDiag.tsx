"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CSSProperties, useEffect, useState } from "react";
import { number } from "zod";
import { useCommande, useUpdateStats } from "../../../app/dashboard/validation/use-commande";
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export const description = "A bar chart with a label";


const chartConfig = {
  count: {
    label: "Commandes",
    color: "rgb(220, 38, 38)",
    gradientStart: "#818cf8",
    gradientEnd: "#4f46e5",
  },
} satisfies ChartConfig;

export function ValidationDiag() {
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  const [_, updateStats] = useUpdateStats();
  const [config] = useCommande();
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        await updateStats();
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [updateStats]);
  const chartData = [
    { month: "Total", count: config.stats.totalCommandes },
    { month: "Non validé", count: config.stats.commandesNonValidees },
    { month: "Validé", count: config.stats.commandesValidees },
  ];
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
    <Card className="h-full w-full">
      <CardHeader>
        <CardDescription>Commandes </CardDescription>
        <CardTitle className="flex items-baseline gap-1 text-2xl tabular-nums">
          {config.stats.totalCommandes}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 2,
            }}
            barCategoryGap="30%" // Augmente l'espacement entre les barres
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  className="bg-white p-2 shadow-md rounded-md"
                />
              }
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={12}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground font-bold"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
