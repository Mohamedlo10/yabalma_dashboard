"use client";

import { AnnonceDiag } from "@/app/dashboard/annonces/components/annonceDiag";
import { DatePickerDemo } from "@/components/ui/datePickerDemo";
import { Input } from "@/components/ui/input";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { type Annonce } from "../schema";
import { useAnnonce } from "../use-annonce";
import { AnnonceDisplay } from "./annonce-display";
import { AnnonceList } from "./annonce-list";
interface AnnonceProps {
	annonces: Annonce[];
	defaultLayout: number[] | undefined;
	defaultCollapsed?: boolean;
	navCollapsedSize: number;
}

export function AnnonceData({
	annonces,
	defaultLayout = [20, 32, 48],
	defaultCollapsed = false,
	navCollapsedSize,
}: AnnonceProps) {
	const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
	const [mail] = useAnnonce();
	const [searchQuery, setSearchQuery] = useState("");
	const annoncesWithFullNames = annonces.map((annonce) => ({
		...annonce,
		trajet: `${annonce.source || ""}${annonce.destination || ""} ${
			annonce.destination || ""
		}${annonce.source || ""}`.toLowerCase(),
		client: annonce.client
			? {
					...annonce.client,
					id: annonce.client.id ?? null,
					fullName: `${annonce.client.nom || ""}${
						annonce.client.prenom || ""
					} ${annonce.client.prenom || ""}${
						annonce.client.nom || ""
					}`.toLowerCase(),
			  }
			: undefined,
	}));
	const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

	const fuse = new Fuse(annoncesWithFullNames, {
		keys: [
			"client.nom",
			"trajet",
			"client.prenom",
			"client.Tel",
			"client.fullName",
		],
		threshold: 0.3,
	});

	const filteredItems = searchQuery
		? fuse.search(searchQuery.toLowerCase()).map((res) => res.item)
		: annonces;

	const filteredByDate = filteredItems.filter((item) => {
		const dateDepart = new Date(item.date_depart);
		const dateArrive = new Date(item.date_arrive);

		return (
			(!startDate || dateDepart >= startDate) &&
			(!endDate || dateArrive <= endDate)
		);
	});

	// Fonction de gestion du changement de l'input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};
	return (
		<TooltipProvider delayDuration={0}>
			<ResizablePanelGroup
				direction="horizontal"
				onLayout={(sizes: number[]) => {
					document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
						sizes
					)}`;
				}}
				className="h-full max-h-[88vh] items-stretch">
				<ResizablePanel
					defaultSize={defaultLayout[0]}
					collapsedSize={navCollapsedSize}
					collapsible={true}
					minSize={25}
					maxSize={25}
					onCollapse={() => {
						setIsCollapsed(true);
						document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
							true
						)}`;
					}}
					onResize={() => {
						setIsCollapsed(false);
						document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
							false
						)}`;
					}}
					className={cn(
						isCollapsed &&
							"min-w-[55px] transition-all duration-300 ease-in-out"
					)}>
					<div
						className={cn(
							"flex h-full flex-col items-center gap-2  justify-start mt-4",
							isCollapsed ? "h-[92px]" : "px-2"
						)}>
						{/* SidePage component */}
						<AnnonceDiag />
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					defaultSize={defaultLayout[1]}
					minSize={35}
					maxSize={40}>
					<Tabs defaultValue="all">
						<div className="flex items-center px-4 py-2">
							<h3 className="text-sm font-bold">Annonces</h3>
							<TabsList className="ml-auto">
								<TabsTrigger
									value="all"
									className="text-zinc-600 dark:text-zinc-200">
									All
								</TabsTrigger>
								<TabsTrigger
									value="is_boost"
									className="text-zinc-600 dark:text-zinc-200">
									Boostee
								</TabsTrigger>
								<TabsTrigger
									value="Validé"
									className="text-zinc-600 dark:text-zinc-200">
									Validé
								</TabsTrigger>
								<TabsTrigger
									value="En_attente"
									className="text-zinc-600 dark:text-zinc-200">
									En attente
								</TabsTrigger>
							</TabsList>
						</div>
						<Separator />
						<div className="bg-background/95 p-1 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
							<form
								onSubmit={(e) => {
									e.preventDefault(); // Empêche le rechargement de la page
								}}>
								{/* Champ de recherche Client */}
								<div className="w-full  grid grid-cols-6 gap-4">
									<div className="mt-2 col-span-2 ">
										<Search className="absolute left-4 top-7 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Rechercher ..."
											className="pl-10 h-12  mb-4"
											value={searchQuery}
											onChange={handleInputChange}
										/>
									</div>

									<div className="flex gap-4 col-span-3">
										{/* Sélection de la Date de Départ */}
										<div>
											<label className="block text-sm font-medium">
												Date de départ
											</label>
											<DatePickerDemo date={startDate} setDate={setStartDate} />
										</div>

										{/* Sélection de la Date d'Arrivée */}
										<div>
											<label className="block text-sm font-medium">
												Date d'arrivée
											</label>
											<DatePickerDemo date={endDate} setDate={setEndDate} />
										</div>
									</div>
								</div>
							</form>
						</div>
						<TabsContent value="all" className="m-0">
							<AnnonceList items={filteredByDate} />
						</TabsContent>
						<TabsContent value="is_boost" className="m-0">
							<AnnonceList
								items={filteredByDate.filter((item) => item.is_boost == true)}
							/>
						</TabsContent>
						<TabsContent value="Validé" className="m-0">
							<AnnonceList
								items={filteredByDate.filter((item) => item.statut == "Validé")}
							/>
						</TabsContent>
						<TabsContent value="En_attente" className="m-0">
							<AnnonceList
								items={filteredByDate.filter(
									(item) => item.statut == "En attente"
								)}
							/>
						</TabsContent>
					</Tabs>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					defaultSize={defaultLayout[2]}
					minSize={35}
					maxSize={40}>
					<AnnonceDisplay
						annonce={
							filteredByDate.find((item) => item.id === mail.selected) || null
						}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>
		</TooltipProvider>
	);
}
