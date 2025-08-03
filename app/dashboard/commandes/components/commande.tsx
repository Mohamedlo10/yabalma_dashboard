"use client";

import { CircleX, ClockAlert, Search } from "lucide-react";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

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
import { useState } from "react";
import { type Commande } from "../schema";
import { useCommande } from "../use-commande";
import { CommandeDisplay } from "./commande-display";
import { CommandeList } from "./commande-list";
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
  const [mail] = useCommande();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");
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

  // Calculer le nombre d'items réellement affichés après tous les filtres
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
    if (activeTab === "payer")
      return filtered.filter((item) => item.payment_status === "paid");
    if (activeTab === "nonPayer")
      return filtered.filter((item) => item.payment_status === "unpaid");
    if (activeTab === "Annuler")
      return filtered.filter((item) => item.cancelled_status);
    return filtered;
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Modernisation des filtres et de la recherche
  return (
    <div className="flex flex-col p-3 max-h-[87vh] w-full">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 p-2 sm:px-3 lg:px-4 flex flex-col gap-2 sm:gap-3 lg:gap-4 items-start sm:items-center justify-between shadow-sm">
        {/* Filtres principaux */}
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "all"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveTab("Validé")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "Validé"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Validées
          </button>
          <button
            onClick={() => setActiveTab("NonValidé")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "NonValidé"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Non validées
          </button>
          <button
            onClick={() => setActiveTab("payer")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "payer"
                ? "bg-green-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Payées
          </button>
          <button
            onClick={() => setActiveTab("nonPayer")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "nonPayer"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Non payées
          </button>
          <button
            onClick={() => setActiveTab("Annuler")}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              activeTab === "Annuler"
                ? "bg-gray-400 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Annulées
          </button>
        </div>

        {/* Recherche et filtres de date */}
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Rechercher..."
            className="border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto min-w-[120px] sm:min-w-[150px]"
            value={searchQuery}
            onChange={handleInputChange}
          />
          <div className="flex gap-1 sm:gap-2 items-center">
            <label className="text-xs font-medium">Départ</label>
            <DatePickerDemo date={startDate} setDate={setStartDate} />
            <label className="text-xs font-medium">Arrivée</label>
            <DatePickerDemo date={endDate} setDate={setEndDate} />
          </div>
          <span className="px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm">
            {filteredItems.length} commande{filteredItems.length > 1 ? "s" : ""}{" "}
            trouvée{filteredItems.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              activeTab +
              searchQuery +
              (startDate?.toISOString() || "") +
              (endDate?.toISOString() || "")
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <CommandeList items={filteredItems} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
