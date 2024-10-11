"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/proprio_table/data-table-view-options"

import { priorities, statuses } from "./data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

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
          placeholder="Filter room..."
          value={(table.getColumn("Room_type")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Room_type")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("Room_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("Room_status")}
            title="Room Status"
            options={statuses}
          />
        )}
        {table.getColumn("Reservation_Status") && (
          <DataTableFacetedFilter
            column={table.getColumn("Reservation_Status")}
            title="reservation Status"
            options={priorities}
          />
        )}
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