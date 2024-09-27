"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterValue = event.target.value.toLowerCase()

    // Appliquer un filtre global personnalisé
    table.setGlobalFilter(filterValue)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Barre de recherche unique */}
        <Input
          placeholder="Rechercher un GP"
          onChange={handleFilterChange}
          className="h-8 w-[250px] lg:w-[400px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

/* {table.getColumn("nom") && (
          <DataTableFacetedFilter
            column={table.getColumn("nom")}
            title="Nom"
            options={[]} // Add options if needed or remove this filter
          />
        )}
        {table.getColumn("Tel") && (
          <DataTableFacetedFilter
            column={table.getColumn("Tel")}
            title="Téléphone"
            options={[]} // Add options if needed or remove this filter
          />
        )} */