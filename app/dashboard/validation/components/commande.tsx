"use client";

import { CircleX, ClockAlert, Search } from "lucide-react";
import * as React from "react";

import { CommandeDiag } from "@/app/dashboard/commandes/components/commandeDiag";
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
import { useEffect, useState } from "react";
import { type Commande } from "../schema";
import { useCommande, useUpdateStats } from "../use-commande";
import { CommandeList } from "./commande-list";
import { ValidationDiag } from "./validationDiag";
import { MoyenneGeneraleComponent } from "./TotalAvalideDiag";
interface CommandeProps {
  commandes: Commande[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function CommandeData({
  commandes,
  defaultLayout = [24, 42, 34],
  defaultCollapsed = false,
  navCollapsedSize,
}: CommandeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState("");

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const commandesWithFullNames = commandes.map((commande) => ({
    ...commande,
    client: commande.client
      ? {
          ...commande.client,
          id: commande.client.id ?? null,
          fullName: `${commande.client.nom || ""}${
            commande.client.prenom || ""
          } || ${commande.client.prenom || ""}${
            commande.client.nom || ""
          }  `.toLowerCase(),
        }
      : null,
    trajet: `${commande.annonce.source || ""}${
      commande.annonce.destination || ""
    } ${commande.annonce.destination || ""}${
      commande.annonce.source || ""
    }`.toLowerCase(),

    annonce: {
      ...commande.annonce,
      client: commande.annonce.client
        ? {
            ...commande.annonce.client,
            id: commande.annonce.client.id ?? null,
            fullName: `${commande.annonce.client.nom || ""}${
              commande.annonce.client.prenom || ""
            } || ${commande.annonce.client.prenom || ""}${
              commande.annonce.client.nom || ""
            }`.toLowerCase(),
          }
        : undefined,
    },
  }));

  const fuse = new Fuse(commandesWithFullNames, {
    keys: [
      "client.nom",
      "client.prenom",
      "client.Tel",
      "trajet",
      "client.fullName",
      "annonce.client.nom",
      "annonce.client.prenom",
      "annonce.client.Tel",
      "annonce.client.fullName",
    ],
    threshold: 0.3,
  });

  const filteredItems = searchQuery
    ? fuse.search(searchQuery.toLowerCase()).map((res) => res.item)
    : commandes;

  const filteredByDate = filteredItems.filter((item) => {
    const dateDepart = new Date(`${item.annonce.date_depart}T23:59:59.999Z`);
    const dateArrive = new Date(`${item.annonce.date_arrive}T23:59:59.999Z`);

    return (
      (!startDate || dateDepart >= startDate) &&
      (!endDate || dateArrive <= endDate)
    );
  });

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
        className="h-full max-h-[88vh] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={28}
          maxSize={45}
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
          )}
        >
          <div
            className={cn(
              "flex h-full flex-col items-center gap-2  justify-start mt-4",
              isCollapsed ? "h-[92px]" : "px-2"
            )}
          >
            {/* SidePage component */}
            <ValidationDiag />
            <MoyenneGeneraleComponent />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={40}
          maxSize={70}
        >
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h2 className="font-bold">Liste des commandes</h2>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="Validé"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Validé
                </TabsTrigger>
                <TabsTrigger
                  value="NonValidé"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Non validé
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // Empêche le rechargement de la page
                }}
              >
                <div className="w-full  grid grid-cols-3 gap-16">
                  <div className="mt-3  ">
                    <Search className="absolute left-7 top-11 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher ..."
                      className="pl-8 h-12  mb-4"
                      value={searchQuery}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex gap-10 w-full col-span-2">
                    {/* Sélection de la Date de Départ */}
                    <div className="flex flex-col items-center justify-center">
                      <label className=" text-[12px] inline-block font-medium">
                        Date de depart
                      </label>
                      <DatePickerDemo date={startDate} setDate={setStartDate} />
                    </div>

                    {/* Sélection de la Date d'Arrivée */}
                    <div className="flex flex-col items-center justify-center">
                      <label className="inline-block text-[12px] font-medium">
                        Date de livraison
                      </label>
                      <DatePickerDemo date={endDate} setDate={setEndDate} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <CommandeList items={filteredByDate} />
            </TabsContent>
            <TabsContent value="Validé" className="m-0">
              <CommandeList
                items={filteredByDate.filter((item) => item.validation_status)}
              />
            </TabsContent>
            <TabsContent value="NonValidé" className="m-0">
              <CommandeList
                items={filteredByDate.filter((item) => !item.validation_status)}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
