"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Filter, MapPin, Truck, BarChart3, Calendar, Star, Settings, Clock, DollarSign, Weight } from "lucide-react"
import { useState } from "react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const statusOptions = [
  { value: "Entrepot", label: "Entrepôt", color: "bg-blue-100 text-blue-800", icon: "🏭" },
  { value: "En cours", label: "En cours", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  { value: "Terminé", label: "Terminé", color: "bg-green-100 text-green-800", icon: "✅" },
  { value: "Annulé", label: "Annulé", color: "bg-red-100 text-red-800", icon: "❌" },
]

const deviseOptions = [
  { value: "FCFA", label: "FCFA", icon: "🇨🇫" },
  { value: "EUR", label: "Euro", icon: "🇪🇺" },
  { value: "USD", label: "Dollar", icon: "🇺🇸" },
]

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const statusFilter = table.getColumn("statut")?.getFilterValue() as string
  const boostFilter = table.getColumn("is_boost")?.getFilterValue() as boolean
  const deviseFilter = table.getColumn("devise_prix")?.getFilterValue() as string
  
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  })

  const [weightFilter, setWeightFilter] = useState({
    minWeight: "",
    maxWeight: ""
  })

  const handleStatusFilter = (status: string) => {
    if (statusFilter === status) {
      table.getColumn("statut")?.setFilterValue(undefined)
    } else {
      table.getColumn("statut")?.setFilterValue(status)
    }
  }

  const handleBoostFilter = (boost: boolean) => {
    if (boostFilter === boost) {
      table.getColumn("is_boost")?.setFilterValue(undefined)
    } else {
      table.getColumn("is_boost")?.setFilterValue(boost)
    }
  }

  const handleDeviseFilter = (devise: string) => {
    if (deviseFilter === devise) {
      table.getColumn("devise_prix")?.setFilterValue(undefined)
    } else {
      table.getColumn("devise_prix")?.setFilterValue(devise)
    }
  }

  const handleDateFilter = () => {
    if (dateFilter.startDate && dateFilter.endDate) {
      // Filtrer par date de départ
      table.getColumn("date_depart")?.setFilterValue({
        start: dateFilter.startDate,
        end: dateFilter.endDate
      })
    }
  }

  const handleWeightFilter = () => {
    if (weightFilter.minWeight || weightFilter.maxWeight) {
      // Filtrer par poids
      table.getColumn("stock_annonce")?.setFilterValue({
        min: weightFilter.minWeight ? parseFloat(weightFilter.minWeight) : undefined,
        max: weightFilter.maxWeight ? parseFloat(weightFilter.maxWeight) : undefined
      })
    }
  }

  const clearDateFilter = () => {
    setDateFilter({ startDate: "", endDate: "" })
    table.getColumn("date_depart")?.setFilterValue(undefined)
  }

  const clearWeightFilter = () => {
    setWeightFilter({ minWeight: "", maxWeight: "" })
    table.getColumn("stock_annonce")?.setFilterValue(undefined)
  }

  const clearAllFilters = () => {
    table.resetColumnFilters()
    setDateFilter({ startDate: "", endDate: "" })
    setWeightFilter({ minWeight: "", maxWeight: "" })
  }

  // Calculer les statistiques par statut
  const getStatusCount = (status: string) => {
    return table.getFilteredRowModel().rows.filter(row => 
      row.getValue("statut") === status
    ).length
  }

  const totalRows = table.getFilteredRowModel().rows.length
  const boostedCount = table.getFilteredRowModel().rows.filter(row => 
    row.getValue("is_boost") === true
  ).length

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{getStatusCount("Entrepot")}</div>
            <div className="text-sm text-muted-foreground">Entrepôt</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount("En cours")}</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div>
            <div className="text-2xl font-bold text-green-600">{getStatusCount("Terminé")}</div>
            <div className="text-sm text-muted-foreground">Terminé</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <div>
            <div className="text-2xl font-bold text-red-600">{getStatusCount("Annulé")}</div>
            <div className="text-sm text-muted-foreground">Annulé</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{boostedCount}</div>
            <div className="text-sm text-muted-foreground">Boostées</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche principale */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par source, destination..."
              value={(table.getColumn("source")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("source")?.setFilterValue(event.target.value)
              }
              className="pl-10 h-10 w-full"
            />
          </div>
          
          {/* Filtre de type de transport */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2">
                <Truck className="h-4 w-4" />
                Type
                {table.getColumn("type_transport")?.getFilterValue() && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Type de transport</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => table.getColumn("type_transport")?.setFilterValue("economy")}
                className="flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                Economy
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => table.getColumn("type_transport")?.setFilterValue("express")}
                className="flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                Express
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtre de devise */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2">
                <DollarSign className="h-4 w-4" />
                Devise
                {deviseFilter && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Devise</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {deviseOptions.map((devise) => (
                <DropdownMenuItem 
                  key={devise.value}
                  onClick={() => handleDeviseFilter(devise.value)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{devise.icon}</span>
                  {devise.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtre de boost */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2">
                <Star className="h-4 w-4" />
                Boost
                {boostFilter !== undefined && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Statut du boost</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleBoostFilter(true)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                Boostées uniquement
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleBoostFilter(false)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-gray-400" />
                Non boostées
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton de réinitialisation */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-10 px-3"
            >
              <Cross2Icon className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
        
        <DataTableViewOptions table={table} />
      </div>

      {/* Filtres de statut */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Statut :</span>
        </div>
        
        <div className="flex items-center gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={statusFilter === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status.value)}
              className={`h-8 px-3 transition-all duration-200 ${
                statusFilter === status.value 
                  ? status.color 
                  : "hover:bg-muted"
              }`}
            >
              <span className="mr-2">{status.icon}</span>
              {status.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {getStatusCount(status.value)}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Indicateur de filtres actifs */}
        {statusFilter && (
          <Badge variant="secondary" className="ml-2">
            Statut: {statusOptions.find(s => s.value === statusFilter)?.label}
          </Badge>
        )}
      </div>

      {/* Filtres avancés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtre de date */}
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Période de départ :</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="h-8 w-40"
              placeholder="Date début"
            />
            <span className="text-sm text-muted-foreground">à</span>
            <Input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="h-8 w-40"
              placeholder="Date fin"
            />
            <Button
              size="sm"
              onClick={handleDateFilter}
              disabled={!dateFilter.startDate || !dateFilter.endDate}
              className="h-8 px-3"
            >
              <Clock className="h-4 w-4 mr-1" />
              Filtrer
            </Button>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearDateFilter}
                className="h-8 px-3"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Filtre de poids */}
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Weight className="h-4 w-4" />
            <span className="font-medium">Poids (kg) :</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={weightFilter.minWeight}
              onChange={(e) => setWeightFilter(prev => ({ ...prev, minWeight: e.target.value }))}
              className="h-8 w-20"
              placeholder="Min"
              min="0"
            />
            <span className="text-sm text-muted-foreground">à</span>
            <Input
              type="number"
              value={weightFilter.maxWeight}
              onChange={(e) => setWeightFilter(prev => ({ ...prev, maxWeight: e.target.value }))}
              className="h-8 w-20"
              placeholder="Max"
              min="0"
            />
            <Button
              size="sm"
              onClick={handleWeightFilter}
              disabled={!weightFilter.minWeight && !weightFilter.maxWeight}
              className="h-8 px-3"
            >
              <Weight className="h-4 w-4 mr-1" />
              Filtrer
            </Button>
            {(weightFilter.minWeight || weightFilter.maxWeight) && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearWeightFilter}
                className="h-8 px-3"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Résumé des filtres actifs */}
      {isFiltered && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg">
          <BarChart3 className="h-4 w-4" />
          <span>Filtres actifs :</span>
          {table.getState().columnFilters.map((filter) => (
            <Badge key={filter.id} variant="outline" className="text-xs">
              {filter.id === "statut" && filter.value 
                ? `Statut: ${statusOptions.find(s => s.value === filter.value)?.label}`
                : filter.id === "is_boost" && filter.value === true
                ? "Boost: Oui"
                : filter.id === "is_boost" && filter.value === false
                ? "Boost: Non"
                : filter.id === "devise_prix" && filter.value
                ? `Devise: ${deviseOptions.find(d => d.value === filter.value)?.label}`
                : filter.id === "date_depart" && filter.value
                ? "Période: Définie"
                : filter.id === "stock_annonce" && filter.value
                ? "Poids: Défini"
                : `${filter.id}: ${filter.value}`
              }
            </Badge>
          ))}
          <span className="ml-2 text-xs">
            ({totalRows} résultat{totalRows > 1 ? 's' : ''})
          </span>
        </div>
      )}
    </div>
  )
} 