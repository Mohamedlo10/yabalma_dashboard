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
    color: "#dc2626",
  },
} satisfies ChartConfig;

export function ClientPays() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  let [color, setColor] = useState("#ffffff");



  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data: any = await getclientPays()
        if (data!=null) {

          setClients(data)         
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
        <CardTitle>Client</CardTitle>
        <CardDescription>Par Pays</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={clients}>
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
            <Bar dataKey="count" fill="var(--color-Client)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Nombre de clients par pays <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          statistique des clients
        </div>
      </CardFooter>
    </Card>
  );
}


export default ClientPays;
