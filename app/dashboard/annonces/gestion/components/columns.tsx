"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, MapPin, Calendar, Package } from "lucide-react"

import { Annonce } from "@/app/dashboard/annonces/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

interface ColumnsProps {
  onEdit: (annonce: Annonce) => void
  onDelete: (annonce: Annonce) => void
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Annonce>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner tout"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id_annonce",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Annonce" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] font-mono text-xs">
        {row.getValue("id_annonce")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type_transport",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type_transport") as string
      return (
        <div className="flex items-center gap-2">
          <Truck className={`h-4 w-4 ${type === 'express' ? 'text-red-600' : 'text-blue-600'}`} />
          <Badge variant={type === 'express' ? 'destructive' : 'default'}>
            {type === 'express' ? 'Express' : 'Economy'}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-green-600" />
        <span className="font-medium">{row.getValue("source")}</span>
      </div>
    ),
  },
  {
    accessorKey: "destination",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destination" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-red-600" />
        <span className="font-medium">{row.getValue("destination")}</span>
      </div>
    ),
  },

  {
    accessorKey: "poids_max",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix Transport" />
    ),
    cell: ({ row }) => {
      const prix = row.getValue("poids_max") as number
      const devise = row.original.devise_prix
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span>{prix ? `${prix} ${devise}` : 'N/A'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "stock_annonce",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Poids Max" />
    ),
    cell: ({ row }) => {
      const poids = row.getValue("stock_annonce") as number
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span>{poids ? `${poids}kg` : 'N/A'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "date_depart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Départ" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date_depart") as string
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{new Date(date).toLocaleDateString('fr-FR')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "date_arrive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Arrivée" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date_arrive") as string
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-red-500" />
          <span>{new Date(date).toLocaleDateString('fr-FR')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "statut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string
      const getStatusColor = (statut: string) => {
        switch (statut) {
          case 'Entrepot': return 'bg-blue-100 text-blue-800'
          case 'En cours': return 'bg-yellow-100 text-yellow-800'
          case 'Terminé': return 'bg-green-100 text-green-800'
          case 'Annulé': return 'bg-red-100 text-red-800'
          default: return 'bg-gray-100 text-gray-800'
        }
      }
      
      return (
        <Badge className={getStatusColor(statut)}>
          {statut}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "is_boost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Boost" />
    ),
    cell: ({ row }) => {
      const isBoost = row.getValue("is_boost") as boolean
      return (
        <Badge variant={isBoost ? "default" : "secondary"}>
          {isBoost ? "Oui" : "Non"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "lieu_depot",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lieu Dépôt" />
    ),
    cell: ({ row }) => (
      <div className="w-[200px] truncate" title={row.getValue("lieu_depot")}>
        {row.getValue("lieu_depot")}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
] 