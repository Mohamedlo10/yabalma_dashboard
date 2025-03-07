"use client"

import {
  Search
} from "lucide-react"
import * as React from "react"

import { CommandeDiag } from "@/app/dashboard/commandes/components/commandeDiag"
import { DatePickerDemo } from "@/components/ui/datePickerDemo"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Fuse from "fuse.js"
import { useState } from "react"
import { type Commande } from '../schema'
import { useCommande } from "../use-commande"
import { CommandeDisplay } from "./commande-display"
import { CommandeList } from "./commande-list"
interface CommandeProps {
  commandes: Commande[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function CommandeData({
  commandes,
  defaultLayout = [24, 42, 34],
  defaultCollapsed = false,
  navCollapsedSize,
}: CommandeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useCommande()
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const commandesWithFullNames = commandes.map((commande) => ({
    ...commande,
    client: commande.client
      ? {
          ...commande.client,
          id: commande.client.id ?? null, 
          fullName: `${commande.client.nom || ""}${commande.client.prenom || ""} || ${commande.client.prenom || ""}${commande.client.nom || ""}  `.toLowerCase(),
        }
      : null, 
      trajet:`${commande.annonce.source || ""}${commande.annonce.destination || ""} ${commande.annonce.destination || ""}${commande.annonce.source || ""}`.toLowerCase(),
  
    annonce: {
      ...commande.annonce,
      client: commande.annonce.client
        ? {
            ...commande.annonce.client,
            id: commande.annonce.client.id ?? null, 
            fullName: `${commande.annonce.client.nom || ""}${commande.annonce.client.prenom || ""} || ${commande.annonce.client.prenom || ""}${commande.annonce.client.nom || ""}`.toLowerCase(),
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
    ? fuse.search(searchQuery.toLowerCase()).map(res => res.item)
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
          )}`
        }}
        className="h-full max-h-[88vh] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={25}
          maxSize={25}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
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
            <CommandeDiag/>
          </div>
          
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={42} maxSize={42}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h3 className="text-sm font-bold">Commandes</h3>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="Valide"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Valide
                </TabsTrigger>
                <TabsTrigger
                  value="Enattente"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  En attente
                </TabsTrigger>
                <TabsTrigger
                  value="payer"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Payer
                </TabsTrigger> 
                <TabsTrigger
                  value="nonPayer"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Non payer
                </TabsTrigger>
                <TabsTrigger
                  value="Annuler"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Annuler
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
                <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                      <div className="mt-3">
                      <Search className="absolute left-4 top-7 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher ..."
                          className="pl-12 h-12 mb-4"
                          value={searchQuery}
                          onChange={handleInputChange}
                        />
                      </div>
                   

                      <div className="flex gap-auto ">
                      {/* Sélection de la Date de Départ */}
                      <div>
                        <label className=" text-[12px] inline-block font-medium">Date de depart</label>
                        <DatePickerDemo date={startDate} setDate={setStartDate} />
                      </div>

                      {/* Sélection de la Date d'Arrivée */}
                      <div>
                        <label className="inline-block text-[12px] font-medium">Date de livraison</label>
                        <DatePickerDemo date={endDate} setDate={setEndDate} />
                      </div>
                    </div>
                    </div>
                </div>
               


              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <CommandeList items={filteredByDate} />
            </TabsContent>
            <TabsContent value="Valide" className="m-0">
              <CommandeList items={filteredByDate.filter((item) => item.validation_status)} />
            </TabsContent>
            <TabsContent value="Enattente" className="m-0">
              <CommandeList items={filteredByDate.filter((item) => !item.validation_status)} />
            </TabsContent>
            <TabsContent value="payer" className="m-0">
              <CommandeList items={filteredByDate.filter(item => item.payment_status == "paid")}/>
            </TabsContent>
            <TabsContent value="nonPayer" className="m-0">
              <CommandeList items={filteredByDate.filter(item => item.payment_status == "unpaid")}/>
            </TabsContent>
            <TabsContent value="Annuler" className="m-0">
              <CommandeList items={filteredByDate.filter((item) => item.cancelled_status)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={34}  maxSize={34}>
          <CommandeDisplay
            commande={filteredByDate.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
