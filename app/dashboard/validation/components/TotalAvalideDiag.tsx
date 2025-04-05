"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
import { useCommande, useUpdateStats } from "../use-commande";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
const chartConfig = {
  visitors: {
    label: "A valide",
  },
  chrome: {
    label: "Chrome",
    color: "#c20000",
  },
} satisfies ChartConfig;

export function MoyenneGeneraleComponent() {
  let [color, setColor] = useState("#ffffff");

  const [isLoading, setIsLoading] = useState(true);
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
    {
      browser: "commandes",
      visitors: config.stats.commandesNonValidees,
      fill: "var(--color-chrome)",
    },
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
  /*   const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []); */
  return (
    <Card className="flex flex-col mt-4">
      <CardHeader className="items-center pb-0">
        <CardTitle>Commandes a validé</CardTitle>
        <CardDescription>Vous</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={55}
              strokeWidth={15}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {config.stats.commandesNonValidees}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          A Validé
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {config.stats.commandesNonValidees < 10
            ? "Peu a valide"
            : config.stats.commandesNonValidees >= 10 &&
              config.stats.commandesNonValidees < 12
            ? "Passable"
            : config.stats.commandesNonValidees >= 12 &&
              config.stats.commandesNonValidees < 14
            ? "AMention : ssez bien"
            : config.stats.commandesNonValidees >= 14 &&
              config.stats.commandesNonValidees < 16
            ? "Mention : Bien"
            : config.stats.commandesNonValidees >= 16 &&
              "Mention : Tres bien"}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {config.stats.commandesNonValidees < 10
            ? "Continuez sur votre lance"
            : "Continuez sur votre lance"}{" "}
        </div>
      </CardFooter>
    </Card>
  );
}
