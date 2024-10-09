"use client"

import {
  Search
} from "lucide-react"
import * as React from "react"

import { CommandeDiag } from "@/app/dashboard/commandes/components/commandeDiag"
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
import { type Commande } from '../schema'
import { useCommande } from "../use-commande"
import { AddCommande } from "./addCommande"
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
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: CommandeProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail] = useCommande()

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
            <AddCommande/>
          </div>
          
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={42} maxSize={45}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Commandes</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Liste des Commandes
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Non consultee
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-12 h-12" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <CommandeList items={commandes} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <CommandeList items={commandes.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}  maxSize={30}>
          <CommandeDisplay
            commande={commandes.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
