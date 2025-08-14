"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { getAnnoncesCountByMonth } from "@/app/api/annonces/query";
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
import BeatLoader from "react-spinners/BeatLoader";
import { number } from "zod";

const override: CSSProperties = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};
export const description = "A bar chart with a label";

let chartData = [
	{ month: "January", count: number },
	{ month: "February", count: number },
	{ month: "March", count: number },
	{ month: "April", count: number },
	{ month: "May", count: number },
	{ month: "June", count: number },
	{ month: "July", count: number },
	{ month: "August", count: number },
	{ month: "September", count: number },
	{ month: "October", count: number },
	{ month: "November", count: number },
	{ month: "December", count: number },
];

const chartConfig = {
	count: {
		label: "Annonces",
		color: "#dc2626",
	},
} satisfies ChartConfig;

export function AnnonceDiag() {
	const [isLoading, setIsLoading] = useState(true);
	let [color, setColor] = useState("#ffffff");
	const [total, setTotal] = useState(0);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			try {
				const data: any = await getAnnoncesCountByMonth();

				if (data.length > 0) {
					console.log(data);
					setTotal(data[0].total_count);
					chartData = data;
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
		<Card className=" w-full">
			<CardHeader>
				<CardDescription>Annonces </CardDescription>
				<CardTitle className="flex items-baseline gap-1 text-2xl tabular-nums">
					{total}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{
							top: 20,
						}}
						barCategoryGap="25%" // Augmente l'espacement entre les barres
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
						<Bar dataKey="count" fill="var(--color-count)" radius={8}>
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
