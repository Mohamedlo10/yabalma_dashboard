"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { DataTableViewOptions } from "@/components/proprio_table/data-table-view-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 space-x-4 items-center ">
        <Input
          placeholder="Rechercher client par Tel ..."
          value={(table.getColumn("Tel")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Tel")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[190px] lg:w-[320px]"
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