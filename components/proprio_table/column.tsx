"use client"
import Link from 'next/link'

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

import { FolderSearch } from 'lucide-react';


import { Log } from "./data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Log>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <DataTableColumnHeader  column={column} title="message" />
    ),

  },
  {
    accessorKey: "userphone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
  },
 

  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Temps" />
    ),
    
  },

  {
    id: "Detail",
    cell: ({ row }) => {
      return (
        <Link href={`room/roomdescription/${row.original.logid}`}  className="flex items-center cursor-pointer" >
          
          <FolderSearch className="w-4 h-4" />
        </Link>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
  
]