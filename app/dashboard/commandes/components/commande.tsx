"use client";
// Hook personnalisé pour détecter la taille de l'écran
const useMediaQuery = (query: any) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

import { CircleX, ClockAlert, Search } from "lucide-react";
import * as React from "react";

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
import { ValidationDiag } from "../../../../components/ui/home/validationDiag";
interface CommandeProps {
  commandes: Commande[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function CommandeData({
  commandes,
  defaultCollapsed = false,
}: CommandeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [defaultLayout, setDefaultLayout] = useState([30, 70]);
  const navCollapsedSize = 4;
  const isMobile = useMediaQuery("(max-width: 768px)"); // Détecte si l'écran est inférieur à md
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [localItems, setLocalItems] = useState<Commande[]>(commandes);
  const commandesWithFullNames = localItems.map((commande) => ({
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
      "id",
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

  const filteredItems = (() => {
    let filtered = searchQuery
      ? fuse.search(searchQuery.toLowerCase()).map((res) => res.item)
      : commandes;
    filtered = filtered.filter((item) => {
      const dateDepart = new Date(`${item.annonce.date_depart}T23:59:59.999Z`);
      const dateArrive = new Date(`${item.annonce.date_arrive}T23:59:59.999Z`);
      return (
        (!startDate || dateDepart >= startDate) &&
        (!endDate || dateArrive <= endDate)
      );
    });
    if (activeTab === "Validé")
      return filtered.filter((item) => item.validation_status);
    if (activeTab === "NonValidé")
      return filtered.filter((item) => !item.validation_status);
    return filtered;
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleItemUpdate = (updatedItem: Commande) => {
    setLocalItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };
  useEffect(() => {
    // Si on est sur mobile, on modifie le layout par défaut
    if (isMobile) {
      setIsCollapsed(true);
    } else {
      // Restaurer l'état depuis les cookies si disponible
      const savedLayout = document.cookie
        .split("; ")
        .find((row) => row.startsWith("react-resizable-panels:layout:mail="));
      if (savedLayout) {
        setDefaultLayout(JSON.parse(savedLayout.split("=")[1]));
      }

      const savedCollapsed = document.cookie
        .split("; ")
        .find((row) => row.startsWith("react-resizable-panels:collapsed="));
      if (savedCollapsed) {
        setIsCollapsed(JSON.parse(savedCollapsed.split("=")[1]));
      }
    }
  }, [isMobile]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes) => {
          // Ne sauvegarder que si on n'est pas sur mobile
          if (!isMobile) {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
              sizes
            )}`;
          }
        }}
        className="h-full max-h-[88vh] items-stretch"
      >
 

        {/* Deuxième panel - prend toute la largeur sur mobile */}
        <ResizablePanel
          defaultSize={isMobile ? 100 : defaultLayout[1]}
          minSize={isMobile ? 100 : 40}
          maxSize={isMobile ? 100 : 70}
        >
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="w-full bg-white sticky top-0 z-10 border-b p-4">
              <div className="flex flex-col md:flex-row md:items-end gap-4 w-full">
                {/* Filtres de statut */}
                <div className="flex gap-2 items-center">
                  <TabsList>
                    <TabsTrigger value="all">Toutes</TabsTrigger>
                    <TabsTrigger value="Validé">Validées</TabsTrigger>
                    <TabsTrigger value="NonValidé">Non validées</TabsTrigger>
                  </TabsList>
                   <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-lgt">
                    {filteredItems.length} 
                  </span>
                </div>
                {/* Recherche et dates */}
                <div className="flex flex-1 sm:flex-row flex-col gap-4 items-center sm:items-end">
                  <div className="flex flex-col w-full">
                    <label className="text-xs font-medium mb-1">
                      Recherche
                    </label>
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher ..."
                        className="pl-8 h-10 w-full"
                        value={searchQuery}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row sm:gap-8 gap-4 w-full sm:justify-start justify-between ">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1">
                        Date de départ
                      </label>
                      <DatePickerDemo date={startDate} setDate={setStartDate} />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1">
                        Date de livraison
                      </label>
                      <DatePickerDemo date={endDate} setDate={setEndDate} />
                    </div>
                  </div>
                 
                </div>
              </div>
            </div>
            <Separator className="hidden md:block" />

            <TabsContent value="all" className="pt-3">
              <CommandeList
                items={filteredItems}
                onItemUpdate={handleItemUpdate}
              />
            </TabsContent>
            <TabsContent value="Validé" className="pt-3">
              <CommandeList
                items={filteredItems}
                onItemUpdate={handleItemUpdate}
              />
            </TabsContent>
            <TabsContent value="NonValidé" className="pt-3">
              <CommandeList
                items={filteredItems}
                onItemUpdate={handleItemUpdate}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        {/* Le second ResizableHandle n'est affiché que si le premier panel est visible */}
        {!isMobile && <ResizableHandle withHandle />}
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

export default CommandeData;
